import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "Use POST for Stripe webhooks" },
    { status: 405 }
  )
}

export async function POST(req: NextRequest) {
  try {
    const stripe = (await import("stripe")).default
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!)

    const body = await req.text()
    const signature = req.headers.get("stripe-signature") || ""

    let event
    try {
      event = stripeInstance.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const orgId = session.metadata?.org_id
        const customerId = session.customer
        const subscriptionId = session.subscription

        if (orgId) {
          await supabase
            .from("orgs")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              tier: "core",
            })
            .eq("id", orgId)

          await supabase
            .from("users")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              tier: "core",
            })
            .eq("id", (await supabase.from("orgs").select("owner_id").eq("id", orgId).single()).data?.owner_id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any
        const orgId = subscription.metadata?.org_id

        if (orgId) {
          await supabase.from("orgs").update({ tier: "free", stripe_subscription_id: null }).eq("id", orgId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Stripe webhook error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
