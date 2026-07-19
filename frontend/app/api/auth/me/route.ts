import { NextResponse } from "next/server"
import { getSession } from "@/lib/aws/session"
import { getTenant } from "@/lib/aws/tenant"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null }, { status: 401 })

  const tenant = session.tenantId ? await getTenant(session.tenantId) : null
  return NextResponse.json({
    user: { email: session.email, sub: session.sub },
    tenant: tenant
      ? {
          tenant_id: tenant.tenant_id,
          company: tenant.company,
          plan: tenant.plan,
          credits: tenant.credits,
          billing_mode: tenant.billing_mode,
        }
      : null,
  })
}
