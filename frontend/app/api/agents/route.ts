import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
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
      return NextResponse.json({ agents: [] })
    }

    const { data: org } = await supabase
      .from("orgs")
      .select("id")
      .eq("owner_id", session.user.id)
      .single()

    if (!org) {
      return NextResponse.json({ agents: [] })
    }

    const { data: agents } = await supabase
      .from("agents")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })

    return NextResponse.json({ agents: agents || [] })
  } catch (err) {
    console.error("GET agents error:", err)
    return NextResponse.json({ agents: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, role, emoji, color, description, system_prompt, triggers, team_id, template_id } = body

    if (!name || !role) {
      return NextResponse.json({ error: "name and role are required" }, { status: 400 })
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

    let orgId: string

    const { data: existingOrg } = await supabase
      .from("orgs")
      .select("id")
      .eq("owner_id", session.user.id)
      .single()

    if (existingOrg) {
      orgId = existingOrg.id
    } else {
      const { data: newOrg } = await supabase
        .from("orgs")
        .insert({ owner_id: session.user.id, name: "My Org", slug: `org-${Date.now().toString(36)}` })
        .select("id")
        .single()
      orgId = newOrg!.id
    }

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        org_id: orgId,
        name,
        role,
        emoji: emoji || "🤖",
        color: color || "#C0272D",
        description,
        system_prompt,
        triggers: triggers || [],
        team_id,
        template_id,
        ai_provider: "openai",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ agent })
  } catch (err) {
    console.error("POST agents error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create agent" },
      { status: 500 }
    )
  }
}
