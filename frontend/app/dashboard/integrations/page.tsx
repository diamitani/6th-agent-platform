"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/hooks/use-app-store"
import { Puzzle, Search, ExternalLink, Check, Zap, Code, Globe, MessageSquare, Mail, BarChart, Camera, Music, ShoppingCart, Cloud, Lock, Database, Smartphone, Video, FileText, Users, Clock, DollarSign, TrendingUp, BookOpen, MapPin, Gift, Shield, Layers, Send, Brain, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Integration {
  id: string; name: string; description: string; category: string; icon: LucideIcon
  authType: string; endpoint: string; docs: string; connected: boolean; mcpAvailable: boolean
}

const ALL_INTEGRATIONS: Integration[] = [
  { id: "hubspot", name: "HubSpot", description: "CRM, contacts, deals, pipeline management", category: "CRM", icon: Users, authType: "OAuth 2.0", endpoint: "https://api.hubapi.com", docs: "https://developers.hubspot.com", connected: false, mcpAvailable: true },
  { id: "salesforce", name: "Salesforce", description: "Enterprise CRM, accounts, opportunities", category: "CRM", icon: Users, authType: "OAuth 2.0", endpoint: "https://login.salesforce.com", docs: "https://developer.salesforce.com", connected: false, mcpAvailable: true },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing & automation", category: "Marketing", icon: Mail, authType: "OAuth 2.0", endpoint: "https://us1.api.mailchimp.com/3.0", docs: "https://mailchimp.com/developer", connected: false, mcpAvailable: true },
  { id: "klaviyo", name: "Klaviyo", description: "Email & SMS marketing platform", category: "Marketing", icon: Mail, authType: "API Key", endpoint: "https://a.klaviyo.com/api", docs: "https://developers.klaviyo.com", connected: false, mcpAvailable: true },
  { id: "sendgrid", name: "SendGrid", description: "Transactional email delivery", category: "Marketing", icon: Send, authType: "API Key", endpoint: "https://api.sendgrid.com/v3", docs: "https://docs.sendgrid.com", connected: false, mcpAvailable: true },
  { id: "stripe", name: "Stripe", description: "Payments, subscriptions, billing", category: "Payments", icon: DollarSign, authType: "API Key", endpoint: "https://api.stripe.com/v1", docs: "https://stripe.com/docs/api", connected: false, mcpAvailable: true },
  { id: "shopify", name: "Shopify", description: "E-commerce platform API", category: "Payments", icon: ShoppingCart, authType: "OAuth 2.0", endpoint: "https://your-store.myshopify.com/admin/api", docs: "https://shopify.dev/docs/api", connected: false, mcpAvailable: true },
  { id: "github", name: "GitHub", description: "Code, repos, issues, PRs, Actions", category: "Dev Tools", icon: Code, authType: "OAuth 2.0", endpoint: "https://api.github.com", docs: "https://docs.github.com/rest", connected: false, mcpAvailable: true },
  { id: "slack", name: "Slack", description: "Team messaging & notifications", category: "Communication", icon: MessageSquare, authType: "OAuth 2.0", endpoint: "https://slack.com/api", docs: "https://api.slack.com", connected: false, mcpAvailable: true },
  { id: "discord", name: "Discord", description: "Server messaging & bots", category: "Communication", icon: MessageSquare, authType: "Webhook", endpoint: "https://discord.com/api/v10", docs: "https://discord.com/developers", connected: false, mcpAvailable: true },
  { id: "notion", name: "Notion", description: "Docs, wikis, project management", category: "Productivity", icon: FileText, authType: "OAuth 2.0", endpoint: "https://api.notion.com/v1", docs: "https://developers.notion.com", connected: false, mcpAvailable: true },
  { id: "twitter", name: "X / Twitter", description: "Post tweets, read timeline, search", category: "Social", icon: MessageSquare, authType: "OAuth 2.0", endpoint: "https://api.twitter.com/2", docs: "https://developer.twitter.com", connected: false, mcpAvailable: true },
  { id: "linkedin", name: "LinkedIn API", description: "Profile, posts, messaging", category: "Social", icon: Globe, authType: "OAuth 2.0", endpoint: "https://api.linkedin.com/v2", docs: "https://developer.linkedin.com", connected: false, mcpAvailable: true },
  { id: "google_analytics", name: "Google Analytics", description: "Web & app analytics", category: "Analytics", icon: BarChart, authType: "OAuth 2.0", endpoint: "https://analyticsdata.googleapis.com", docs: "https://developers.google.com/analytics", connected: false, mcpAvailable: true },
  { id: "openai", name: "OpenAI API", description: "GPT-4, Assistants, embeddings", category: "AI/ML", icon: Brain, authType: "API Key", endpoint: "https://api.openai.com/v1", docs: "https://platform.openai.com/docs", connected: false, mcpAvailable: true },
  { id: "anthropic", name: "Anthropic Claude", description: "Claude API, messages, thinking", category: "AI/ML", icon: Brain, authType: "API Key", endpoint: "https://api.anthropic.com/v1", docs: "https://docs.anthropic.com", connected: false, mcpAvailable: true },
  { id: "elevenlabs", name: "ElevenLabs", description: "Text-to-speech & voice cloning", category: "AI/ML", icon: Music, authType: "API Key", endpoint: "https://api.elevenlabs.io/v1", docs: "https://elevenlabs.io/docs", connected: false, mcpAvailable: true },
  { id: "spotify", name: "Spotify API", description: "Music data, playlists, analytics", category: "Music", icon: Music, authType: "OAuth 2.0", endpoint: "https://api.spotify.com/v1", docs: "https://developer.spotify.com", connected: false, mcpAvailable: true },
  { id: "youtube", name: "YouTube Data", description: "Video analytics, search, comments", category: "Social", icon: Video, authType: "OAuth 2.0", endpoint: "https://www.googleapis.com/youtube/v3", docs: "https://developers.google.com/youtube", connected: false, mcpAvailable: true },
  { id: "instagram", name: "Instagram Graph", description: "Instagram content & insights", category: "Social", icon: Camera, authType: "OAuth 2.0", endpoint: "https://graph.facebook.com/v18.0", docs: "https://developers.facebook.com", connected: false, mcpAvailable: true },
  { id: "google_sheets", name: "Google Sheets", description: "Spreadsheet creation & editing", category: "Productivity", icon: FileText, authType: "OAuth 2.0", endpoint: "https://sheets.googleapis.com/v4", docs: "https://developers.google.com/sheets", connected: false, mcpAvailable: true },
  { id: "vercel", name: "Vercel", description: "Deployments, domains, serverless", category: "Dev Tools", icon: Cloud, authType: "OAuth 2.0", endpoint: "https://api.vercel.com", docs: "https://vercel.com/docs/rest-api", connected: false, mcpAvailable: true },
  { id: "supabase", name: "Supabase", description: "Database, auth, storage, realtime", category: "Dev Tools", icon: Database, authType: "API Key", endpoint: "https://api.supabase.com/v1", docs: "https://supabase.com/docs/reference", connected: false, mcpAvailable: true },
  { id: "calendly", name: "Calendly", description: "Scheduling & appointments", category: "Scheduling", icon: Clock, authType: "OAuth 2.0", endpoint: "https://api.calendly.com", docs: "https://developer.calendly.com", connected: false, mcpAvailable: true },
  { id: "twilio", name: "Twilio", description: "SMS, voice & WhatsApp messaging", category: "Communication", icon: MessageSquare, authType: "API Key", endpoint: "https://api.twilio.com", docs: "https://www.twilio.com/docs", connected: false, mcpAvailable: true },
]

const CATEGORIES = Array.from(new Set(ALL_INTEGRATIONS.map((i) => i.category)))
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "CRM": Users, "Marketing": Mail, "Social": Globe, "Analytics": BarChart, "Communication": MessageSquare,
  "Productivity": Layers, "Payments": DollarSign, "AI/ML": Brain, "Dev Tools": Code, "Storage": Database,
  "Music": Music, "Video": Video, "Scheduling": Clock, "Support": MessageSquare, "Legal": Shield, "Location": MapPin,
}

export default function IntegrationsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [selected, setSelected] = useState<Integration | null>(null)

  const filtered = ALL_INTEGRATIONS.filter((i) => {
    const m = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
    const c = category === "All" || i.category === category
    return m && c
  })

  const mcpCount = ALL_INTEGRATIONS.filter((i) => i.mcpAvailable).length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-primary" />
              <h1 className="font-heading text-3xl font-bold">Integrations</h1>
            </div>
            <p className="mt-1 text-muted-foreground">{ALL_INTEGRATIONS.length} available · {mcpCount} with MCP support</p>
          </div>
          <Badge variant="gold" className="gap-1.5 px-3 py-1.5 text-xs"><Zap className="h-3.5 w-3.5" /> {mcpCount} MCP Ready</Badge>
        </div>

        {/* Live Composio connect — mints a fresh OAuth link on click (links expire in ~10 min) */}
        <div className="command-card flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Connect a live account via Composio</p>
            <p className="text-xs text-muted-foreground">
              One click mints a fresh authorization link and sends you straight to the provider&apos;s consent screen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["gmail", "googlecalendar", "slack", "hubspot", "notion"].map((t) => (
              <a key={t} href={`/api/composio/connect?toolkit=${t}`} target="_blank" rel="noopener noreferrer">
                <Badge variant="secondary" className="cursor-pointer px-3 py-1.5 text-xs capitalize transition-colors hover:bg-primary/10 hover:text-primary">
                  {t === "googlecalendar" ? "Calendar" : t}
                </Badge>
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input className="input-field pl-11" placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] || Puzzle
            const count = ALL_INTEGRATIONS.filter((i) => i.category === cat).length
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  category === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-charcoal-light border border-border/50 hover:border-primary/30"
                }`}>
                <CatIcon className="h-3.5 w-3.5" />{cat} <span className="opacity-60">({count})</span>
              </button>
            )
          })}
          {category !== "All" && (
            <button onClick={() => setCategory("All")} className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-charcoal">Clear</button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((integration) => (
            <Dialog key={integration.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-parchment-dark shadow-sm">
                        <integration.icon className="h-5.5 w-5.5 text-charcoal-light" />
                      </div>
                      {integration.mcpAvailable && <Badge variant="gold" className="text-[10px] h-5"><Zap className="h-3 w-3 mr-0.5" />MCP</Badge>}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{integration.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{integration.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{integration.category}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{integration.authType}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-parchment-dark"><integration.icon className="h-5.5 w-5.5" /></div>
                    {integration.name}
                  </DialogTitle>
                  <DialogDescription>{integration.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-xl bg-parchment-dark p-4 text-sm space-y-2.5">
                    {[
                      { label: "Auth Type", value: integration.authType },
                      { label: "API Endpoint", value: integration.endpoint, mono: true },
                      { label: "Category", value: integration.category },
                      { label: "MCP Ready", value: integration.mcpAvailable ? "✅ Yes" : "❌ No" },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-medium text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => { addToast(`Connecting to ${integration.name}...`, "info"); setTimeout(() => addToast(`${integration.name} connected`, "success"), 1500) }} className="flex-1 gap-2">
                      <Zap className="h-4 w-4" /> Connect
                    </Button>
                    <Button variant="outline" asChild><a href={integration.docs} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                  </div>
                  {integration.mcpAvailable && (
                    <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/5 to-gold/0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-gold" />
                        <span className="text-sm font-semibold text-gold-foreground">MCP Server Available</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Agents can use this integration as a tool via Model Context Protocol.</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16">
            <Puzzle className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No integrations match</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
