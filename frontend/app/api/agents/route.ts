import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/aws/session"
import { createAgent, listAgents } from "@/lib/aws/tenant"

// Agents live in DynamoDB, scoped by tenant. AWS-only — no Supabase.

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.tenantId) return NextResponse.json({ agents: [] })

    const agents = await listAgents(session.tenantId)
    return NextResponse.json({
      agents: agents.map((a) => ({ ...a, id: a.agent_id })),
    })
  } catch (err) {
    console.error("GET agents error:", err)
    return NextResponse.json({ agents: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, role, emoji, color, description, system_prompt, triggers, tools } = body
    if (!name || !role) {
      return NextResponse.json({ error: "name and role are required" }, { status: 400 })
    }

    const agent = await createAgent(session.tenantId, {
      name,
      role,
      emoji: emoji || "🤖",
      color: color || "#FF6B00",
      description,
      system_prompt,
      triggers: triggers || [],
      tools: tools || [],
    })

    return NextResponse.json({ agent: { ...agent, id: agent.agent_id } })
  } catch (err) {
    console.error("POST agents error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create agent" },
      { status: 500 }
    )
  }
}
