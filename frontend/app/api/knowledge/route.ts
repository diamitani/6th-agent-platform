import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, doc_type, content, tags, namespace } = body

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 })
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

    const { data: org } = await supabase
      .from("orgs")
      .select("id")
      .eq("owner_id", session.user.id)
      .single()

    if (!org) return NextResponse.json({ error: "No org found" }, { status: 404 })

    const { data: doc, error } = await supabase
      .from("knowledge_docs")
      .insert({
        org_id: org.id,
        title,
        doc_type: doc_type || "Research",
        content,
        tags: tags || [],
        namespace: namespace || `org/${org.id}`,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ doc })
  } catch (err) {
    console.error("Knowledge API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create doc" },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json({ docs: [] })
    }

    const { data: org } = await supabase
      .from("orgs")
      .select("id")
      .eq("owner_id", session.user.id)
      .single()

    if (!org) return NextResponse.json({ docs: [] })

    const { data: docs } = await supabase
      .from("knowledge_docs")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })

    return NextResponse.json({ docs: docs || [] })
  } catch (err) {
    return NextResponse.json({ docs: [] })
  }
}
