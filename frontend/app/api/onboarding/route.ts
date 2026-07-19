import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/aws/session"
import { createAgent, writeTenantDoc } from "@/lib/aws/tenant"

// Onboarding = PAL questionnaire -> org profile docs on S3 + starter agents
// in DynamoDB. AWS-only — no Supabase.

const STARTER_TEMPLATES: Record<
  string,
  { name: string; role: string; emoji: string; color: string; prompt: string; triggers: string[] }
> = {
  t1: {
    name: "Chief of Staff", role: "Orchestrator", emoji: "🎯", color: "#C96442",
    prompt: "You are the Chief of Staff. Run triage, priorities, and weekly reports. Classify every task NPAO (Necessity, Anxiety, Priority, Opportunity) and execute N->A->P->O.",
    triggers: ["triage", "status", "priorities"],
  },
  t2: {
    name: "Marketing Manager", role: "Growth", emoji: "📊", color: "#2563EB",
    prompt: "You are the Marketing Manager. Own campaigns, channels, and CAC. Tie every recommendation to the org's ICP and stage.",
    triggers: ["campaign", "channels", "cac"],
  },
  t3: {
    name: "Content Writer", role: "Content", emoji: "✍️", color: "#DB2777",
    prompt: "You are the Content Writer. Create content and copy in the org's voice: confident, helpful, concise. Verbs and outcomes over buzzwords.",
    triggers: ["content", "draft", "copy"],
  },
  t5: {
    name: "Social Media", role: "Social", emoji: "📱", color: "#7C3AED",
    prompt: "You are the Social Media agent. Draft posts, captions, and engagement replies native to each channel's tone.",
    triggers: ["post", "caption", "social"],
  },
  t6: {
    name: "Research Agent", role: "Research", emoji: "🔍", color: "#059669",
    prompt: "You are the Research Agent. Deliver market and competitive intelligence. Flag estimates as estimates; never invent data.",
    triggers: ["research", "competitive", "market"],
  },
  t9: {
    name: "Builder Agent", role: "Dev", emoji: "🏗️", color: "#EA580C",
    prompt: "You are the Builder Agent. Ship product features. Finish. Process. Effective — production-ready output only.",
    triggers: ["ship", "build", "launch"],
  },
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orgName, industry, identity, icp, goal, selectedAgents } = await req.json()
    if (!orgName) {
      return NextResponse.json({ error: "orgName is required" }, { status: 400 })
    }
    const tenantId = session.tenantId

    // PAL stage: compile the questionnaire into org profile docs on S3
    await Promise.all([
      writeTenantDoc(
        tenantId,
        "identity.md",
        `# ${orgName} — Identity\n\n## Who we are\n${identity || "(fill in)"}\n\n## Industry\n${industry || "(fill in)"}\n\n## Primary goal\n${goal || "(fill in)"}\n`
      ),
      writeTenantDoc(
        tenantId,
        "icp.md",
        `# ${orgName} — Ideal Customer Profile\n\n${icp || "(fill in)"}\n\nRefine with the ICP Creator skill (Enably GTM pack).\n`
      ),
      writeTenantDoc(
        tenantId,
        "positioning.md",
        `# ${orgName} — Positioning\n\nFor ${icp || "[target buyer]"} pursuing ${goal || "[goal]"}, ${orgName} delivers.\n\nVoice: confident, helpful, concise.\n`
      ),
    ])

    // Starter roster in DynamoDB
    const chosen: string[] = selectedAgents?.length ? selectedAgents : ["t1"]
    const created = []
    for (const id of chosen) {
      const t = STARTER_TEMPLATES[id]
      if (!t) continue
      created.push(
        await createAgent(tenantId, {
          name: t.name,
          role: t.role,
          emoji: t.emoji,
          color: t.color,
          description: t.prompt.split(".")[0],
          system_prompt: `${t.prompt}\n\nOrganization: ${orgName}. ICP: ${icp || "TBD"}. Goal: ${goal || "TBD"}.`,
          triggers: t.triggers,
          tools: [],
        })
      )
    }

    return NextResponse.json({
      ok: true,
      tenant_id: tenantId,
      agents: created.map((a) => ({ ...a, id: a.agent_id })),
    })
  } catch (err) {
    console.error("Onboarding error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding failed" },
      { status: 500 }
    )
  }
}
