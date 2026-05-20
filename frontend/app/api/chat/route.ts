import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { agentId, message, threadId } = await req.json()

    if (!agentId || !message) {
      return NextResponse.json({ error: "agentId and message are required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
            catch { /* ignore */ }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from("agents")
      .select("*, orgs!inner(*)")
      .eq("id", agentId)
      .single()

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const { data: linkedDocs } = await supabase
      .from("agent_kb_links")
      .select("knowledge_docs(*)")
      .eq("agent_id", agentId)

    let systemInstructions = agent.system_prompt || `You are ${agent.name}, ${agent.role} for this organization.`

    if (agent.pal_protocol) {
      systemInstructions += `\n\n--- PAL PROTOCOL ---\n${agent.pal_protocol}`
    }

    if (agent.npao_notes) {
      systemInstructions += `\n\n--- NPAO NOTES ---\n${agent.npao_notes}`
    }

    if (linkedDocs && linkedDocs.length > 0) {
      systemInstructions += "\n\n--- KNOWLEDGE BASE ---"
      for (const link of linkedDocs) {
        const doc = link.knowledge_docs as any
        if (doc?.content) {
          systemInstructions += `\n## ${doc.title}\n${doc.content}`
        }
      }
    }

    const OpenAI = (await import("openai")).default
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    let activeThreadId = threadId

    if (!activeThreadId) {
      const thread = await openai.beta.threads.create()
      activeThreadId = thread.id
    }

    let openaiAssistantId = agent.openai_assistant_id

    if (!openaiAssistantId) {
      const assistant = await openai.beta.assistants.create({
        model: "gpt-4o",
        name: agent.name,
        instructions: systemInstructions,
        tools: [{ type: "file_search" }],
      })
      openaiAssistantId = assistant.id

      await supabase.from("agents").update({ openai_assistant_id: openaiAssistantId }).eq("id", agentId)
    } else {
      await openai.beta.assistants.update(openaiAssistantId, {
        instructions: systemInstructions,
      })
    }

    await openai.beta.threads.messages.create(activeThreadId, {
      role: "user",
      content: message,
    })

    const run = await openai.beta.threads.runs.create(activeThreadId, {
      assistant_id: openaiAssistantId,
    })

    let runStatus = run.status
    const startTime = Date.now()
    const timeout = 60000

    while (runStatus !== "completed" && runStatus !== "failed" && runStatus !== "cancelled") {
      if (Date.now() - startTime > timeout) {
        return NextResponse.json({ error: "Request timed out" }, { status: 504 })
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const runCheck = await openai.beta.threads.runs.retrieve(run.id, { thread_id: activeThreadId })
      runStatus = runCheck.status
    }

    if (runStatus === "failed") {
      return NextResponse.json({ error: "Assistant run failed" }, { status: 500 })
    }

    const threadMessages = await openai.beta.threads.messages.list(activeThreadId, {
      order: "desc",
      limit: 1,
    })

    const lastMessage = threadMessages.data[0]
    const responseText = lastMessage?.content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text.value)
      .join("\n") || "No response"

    await supabase.from("chat_messages").insert([
      { thread_id: activeThreadId, role: "user", content: message },
      { thread_id: activeThreadId, role: "assistant", content: responseText },
    ])

    await supabase.from("hub_events").insert({
      org_id: agent.org_id,
      agent_id: agentId,
      event_type: "task_complete",
      namespace: `org/${agent.org_id}`,
      content: {
        agent_name: agent.name,
        trigger: message.slice(0, 200),
        output_preview: responseText.slice(0, 200),
        thread_id: activeThreadId,
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({ response: responseText, threadId: activeThreadId })
  } catch (err) {
    console.error("Chat API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
