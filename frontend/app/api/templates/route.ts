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
      return NextResponse.json({ template: null })
    }

    const { data: templates } = await supabase
      .from("agent_templates")
      .select("*")
      .eq("is_public", true)
      .order("use_count", { ascending: false })
      .limit(50)

    return NextResponse.json({ templates: templates || [] })
  } catch (err) {
    return NextResponse.json({ templates: [] })
  }
}
