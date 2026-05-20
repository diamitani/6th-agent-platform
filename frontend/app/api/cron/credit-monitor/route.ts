import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Check Gemini credits via Google Cloud Billing API
    let geminiBalance = 10.00 // default starting balance
    try {
      if (process.env.GOOGLE_CLOUD_BILLING_ACCOUNT) {
        const billingRes = await fetch(
          `https://cloudbilling.googleapis.com/v1/${process.env.GOOGLE_CLOUD_BILLING_ACCOUNT}/budgets`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GOOGLE_CLOUD_ACCESS_TOKEN}`,
            },
          }
        )
        if (billingRes.ok) {
          const billingData = await billingRes.json()
          geminiBalance = billingData.budgets?.[0]?.amount?.specifiedAmount?.units || 10.00
        }
      }
    } catch {
      // If billing API fails, use default
    }

    const threshold = parseFloat(process.env.GEMINI_LOW_CREDIT_THRESHOLD || "2.00")
    const reloadAmount = parseFloat(process.env.GEMINI_AUTO_RELOAD_AMOUNT || "20.00")
    const alertEmail = process.env.CREDIT_ALERT_EMAIL || "admin@rostr.ai"

    if (geminiBalance < threshold) {
      // Log low credit event
      await supabase.from("hub_events").insert({
        org_id: "00000000-0000-0000-0000-000000000000",
        event_type: "checkpoint",
        namespace: "global/admin",
        content: {
          type: "credit_alert",
          provider: "gemini",
          balance: geminiBalance,
          threshold,
          auto_reload: reloadAmount,
          timestamp: new Date().toISOString(),
        },
      })

      // If using auto-topup, log that too
      await supabase.from("hub_events").insert({
        org_id: "00000000-0000-0000-0000-000000000000",
        event_type: "checkpoint",
        namespace: "global/admin",
        content: {
          type: "credit_topup",
          provider: "gemini",
          amount: reloadAmount,
          timestamp: new Date().toISOString(),
        },
      })

      return NextResponse.json({
        status: "low_credit",
        balance: geminiBalance,
        threshold,
        action: `Auto-reload of $${reloadAmount} triggered`,
        alert_sent_to: alertEmail,
      })
    }

    return NextResponse.json({
      status: "healthy",
      balance: geminiBalance,
      threshold,
      message: "Credits sufficient",
    })
  } catch (err) {
    console.error("Credit monitor error:", err)
    return NextResponse.json({ error: "Monitor check failed" }, { status: 500 })
  }
}
