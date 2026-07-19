import { NextRequest, NextResponse } from "next/server"

// Composio toolkit catalog proxy.
// Live when COMPOSIO_API_KEY is set (key stays server-side); otherwise the
// curated catalog keeps the arsenal UI fully functional in demo mode.

const COMPOSIO_BASE = process.env.COMPOSIO_BASE_URL || "https://backend.composio.dev/api/v3"

export interface Toolkit {
  slug: string
  name: string
  category: string
  description: string
  logo?: string
  tools_count?: number
  source: "composio" | "curated"
}

const CURATED_TOOLKITS: Toolkit[] = [
  { slug: "gmail", name: "Gmail", category: "email", description: "Send, read, and manage email", source: "curated" },
  { slug: "googlecalendar", name: "Google Calendar", category: "productivity", description: "Schedule and manage events", source: "curated" },
  { slug: "slack", name: "Slack", category: "communication", description: "Post messages, manage channels", source: "curated" },
  { slug: "hubspot", name: "HubSpot", category: "crm", description: "CRM contacts, deals, pipelines", source: "curated" },
  { slug: "salesforce", name: "Salesforce", category: "crm", description: "Enterprise CRM operations", source: "curated" },
  { slug: "notion", name: "Notion", category: "productivity", description: "Pages, databases, and docs", source: "curated" },
  { slug: "github", name: "GitHub", category: "developer", description: "Repos, issues, pull requests", source: "curated" },
  { slug: "linear", name: "Linear", category: "developer", description: "Issue tracking and projects", source: "curated" },
  { slug: "googlesheets", name: "Google Sheets", category: "productivity", description: "Read and write spreadsheets", source: "curated" },
  { slug: "googledrive", name: "Google Drive", category: "storage", description: "Files and folders", source: "curated" },
  { slug: "linkedin", name: "LinkedIn", category: "marketing", description: "Posts and company pages", source: "curated" },
  { slug: "twitter", name: "X (Twitter)", category: "marketing", description: "Post and engage", source: "curated" },
  { slug: "stripe", name: "Stripe", category: "finance", description: "Payments, customers, invoices", source: "curated" },
  { slug: "shopify", name: "Shopify", category: "commerce", description: "Products, orders, customers", source: "curated" },
  { slug: "airtable", name: "Airtable", category: "productivity", description: "Bases, tables, records", source: "curated" },
  { slug: "discord", name: "Discord", category: "communication", description: "Servers and messages", source: "curated" },
  { slug: "jira", name: "Jira", category: "developer", description: "Issues and sprints", source: "curated" },
  { slug: "zendesk", name: "Zendesk", category: "support", description: "Tickets and customers", source: "curated" },
  { slug: "apollo", name: "Apollo", category: "sales", description: "Prospecting and enrichment", source: "curated" },
  { slug: "calendly", name: "Calendly", category: "productivity", description: "Scheduling links and bookings", source: "curated" },
]

export async function GET(req: NextRequest) {
  const apiKey = process.env.COMPOSIO_API_KEY
  const limit = req.nextUrl.searchParams.get("limit") || "60"

  if (!apiKey) {
    return NextResponse.json({ items: CURATED_TOOLKITS, mode: "curated" })
  }

  try {
    const res = await fetch(`${COMPOSIO_BASE}/toolkits?limit=${limit}`, {
      headers: { "x-api-key": apiKey },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Composio responded ${res.status}`)
    const data = await res.json()
    const items: Toolkit[] = (data.items || []).map((t: any) => {
      const meta = t.meta || {}
      const categories = meta.categories || []
      return {
        slug: t.slug,
        name: t.name,
        category: categories[0]?.name || "other",
        description: meta.description || "",
        logo: meta.logo,
        tools_count: meta.tools_count,
        source: "composio" as const,
      }
    })
    return NextResponse.json({ items, mode: "live" })
  } catch (err) {
    console.error("Composio proxy error:", err)
    return NextResponse.json({ items: CURATED_TOOLKITS, mode: "curated" })
  }
}
