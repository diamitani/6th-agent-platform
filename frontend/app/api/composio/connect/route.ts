import { NextRequest, NextResponse } from "next/server"

// Always-fresh Composio OAuth connect. Composio link tokens expire in ~10
// minutes, so we mint one at click time and redirect straight into it:
//
//   GET /api/composio/connect?toolkit=gmail
//
// Finds (or creates) a Composio-managed auth config for the toolkit, creates
// a connection link for the workspace user, and 307s to the OAuth screen.

const COMPOSIO_BASE = process.env.COMPOSIO_BASE_URL || "https://backend.composio.dev/api/v3"

export async function GET(req: NextRequest) {
  const apiKey = process.env.COMPOSIO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "COMPOSIO_API_KEY not configured" }, { status: 503 })
  }

  const toolkit = (req.nextUrl.searchParams.get("toolkit") || "gmail").toLowerCase()
  const userId = req.nextUrl.searchParams.get("user_id") || "patrick.diamitani@gmail.com"
  const headers = { "x-api-key": apiKey, "Content-Type": "application/json" }

  try {
    // 1. Find an existing auth config for this toolkit
    const cfgRes = await fetch(`${COMPOSIO_BASE}/auth_configs?toolkit_slug=${toolkit}`, { headers })
    const cfgData = await cfgRes.json()
    let authConfigId: string | undefined = (cfgData.items || []).find(
      (c: any) => c.toolkit?.slug === toolkit
    )?.id

    // 2. Or create a Composio-managed one
    if (!authConfigId) {
      const createRes = await fetch(`${COMPOSIO_BASE}/auth_configs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          toolkit: { slug: toolkit },
          auth_config: { type: "use_composio_managed_auth" },
        }),
      })
      const created = await createRes.json()
      authConfigId = created.auth_config?.id || created.id
      if (!authConfigId) throw new Error(`Could not create auth config for ${toolkit}`)
    }

    // 3. Mint a fresh connection link (valid ~10 minutes) and redirect
    const linkRes = await fetch(`${COMPOSIO_BASE}/connected_accounts/link`, {
      method: "POST",
      headers,
      body: JSON.stringify({ auth_config_id: authConfigId, user_id: userId }),
    })
    const link = await linkRes.json()
    if (!link.redirect_url) throw new Error(`No redirect URL returned for ${toolkit}`)

    return NextResponse.redirect(link.redirect_url, { status: 307 })
  } catch (err) {
    console.error("Composio connect error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Connect failed" },
      { status: 502 }
    )
  }
}
