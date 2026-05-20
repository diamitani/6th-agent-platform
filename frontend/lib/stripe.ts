import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-02-24.acacia" as any,
      typescript: true,
    })
  }
  return stripeInstance
}

export const TIER_PRICES: Record<string, string> = {
  core: process.env.STRIPE_CORE_PRICE_ID || "",
  pro: process.env.STRIPE_PRO_PRICE_ID || "",
}

export async function createCheckoutSession(
  priceId: string,
  orgId: string,
  email: string,
  domain: string
) {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { org_id: orgId },
    success_url: `${domain}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/pricing`,
  })
}

export async function createCustomerPortalSession(
  stripeCustomerId: string,
  domain: string
) {
  const stripe = getStripe()
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${domain}/dashboard/settings`,
  })
}
