import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user) return null

  const supabase = await createServerSupabaseClient()
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return user
}

export async function getCurrentOrg() {
  const session = await getSession()
  if (!session?.user) return null

  const supabase = await createServerSupabaseClient()
  const { data: org } = await supabase
    .from("orgs")
    .select("*")
    .eq("owner_id", session.user.id)
    .single()

  return org
}
