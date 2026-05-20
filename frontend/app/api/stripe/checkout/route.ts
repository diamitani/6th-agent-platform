import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { priceId, orgId } = await req.json()

    if (!priceId || !orgId) {
      return NextResponse.json({ error: "priceId and orgId required" }, { status: 400 })
    }

    const { createServerClient } = await import("@supabase/ssr")
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: org } = await supabase
      .from("orgs")
      .select("*")
      .eq("id", orgId)
      .single()

    if (!org || org.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const stripe = getStripe()
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { org_id: orgId },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    )
  }
}
