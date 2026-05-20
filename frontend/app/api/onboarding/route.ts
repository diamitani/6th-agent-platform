import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orgName, industry, identity, icp, goal, selectedAgents } = body

    if (!orgName) {
      return NextResponse.json({ error: "orgName is required" }, { status: 400 })
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

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36)

    const { data: org, error: orgError } = await supabase
      .from("orgs")
      .upsert({
        owner_id: session.user.id,
        name: orgName,
        slug,
        identity_md: identity || null,
        icp_md: icp || null,
        tier: "free",
      })
      .select()
      .single()

    if (orgError) throw orgError

    // Create default team
    const { data: team } = await supabase
      .from("teams")
      .insert({
        org_id: org.id,
        name: `${orgName} Core Team`,
        description: "Your primary agent team",
      })
      .select()
      .single()

    // Clone selected templates as agents
    if (selectedAgents && selectedAgents.length > 0) {
      const { data: templates } = await supabase
        .from("agent_templates")
        .select("*")
        .in("id", selectedAgents)

      if (templates) {
        for (const template of templates) {
          await supabase.from("agents").insert({
            org_id: org.id,
            team_id: team?.id,
            template_id: template.id,
            name: template.name,
            role: template.role,
            emoji: template.emoji,
            color: template.color,
            description: template.description,
            system_prompt: template.system_prompt,
            triggers: template.triggers,
            ai_provider: "openai",
          })
        }
      }
    }

    return NextResponse.json({ org, team })
  } catch (err) {
    console.error("Onboarding error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding failed" },
      { status: 500 }
    )
  }
}
