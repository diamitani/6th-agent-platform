"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/hooks/use-app-store"
import { mcpHub } from "@/lib/mcp-hub"
import { Puzzle, Search, Zap, ExternalLink, Check, ArrowRight, Plug, Settings, Power, PowerOff } from "lucide-react"

const POPULAR_INTEGRATIONS = [
  { id: "github", name: "GitHub", icon: "⬛", category: "Dev Tools", authType: "oauth", description: "Code, repos, issues, PRs" },
  { id: "slack", name: "Slack", icon: "💬", category: "Communication", authType: "oauth", description: "Team messaging & notifications" },
  { id: "notion", name: "Notion", icon: "📝", category: "Productivity", authType: "oauth", description: "Docs, wikis, project management" },
  { id: "gmail", name: "Gmail", icon: "📧", category: "Communication", authType: "oauth", description: "Email reading & sending" },
  { id: "google_calendar", name: "Google Calendar", icon: "📅", category: "Productivity", authType: "oauth", description: "Calendar events & scheduling" },
  { id: "stripe", name: "Stripe", icon: "💳", category: "Payments", authType: "apikey", description: "Payments & subscriptions" },
  { id: "twitter", name: "X / Twitter", icon: "🐦", category: "Social", authType: "oauth", description: "Post & read tweets" },
  { id: "spotify", name: "Spotify", icon: "🎵", category: "Music", authType: "oauth", description: "Music data & playlists" },
]

export function MCPIntegrationHub() {
  const addToast = useAppStore((s) => s.addToast)
  const [search, setSearch] = useState("")
  const [connected, setConnected] = useState<Set<string>>(new Set())

  const filtered = POPULAR_INTEGRATIONS.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleConnect = async (integrationId: string) => {
    addToast(`Connecting to ${integrationId}...`, "info")
    await new Promise((r) => setTimeout(r, 1000))
    setConnected((prev) => new Set(prev).add(integrationId))
    addToast(`✅ ${integrationId} connected`, "success")
  }

  const handleDisconnect = (integrationId: string) => {
    setConnected((prev) => { const n = new Set(prev); n.delete(integrationId); return n })
    addToast(`${integrationId} disconnected`, "info")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Puzzle className="h-6 w-6 text-primary" />
        <div>
          <h2 className="font-heading text-2xl font-bold">MCP Integration Hub</h2>
          <p className="text-sm text-muted-foreground">Connect any service via OAuth — your agents gain instant tool access</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <input className="input-field pl-11" placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {filtered.map((integration) => {
          const isConnected = connected.has(integration.id)
          return (
            <Card key={integration.id} className={`transition-all ${isConnected ? "border-green-300 bg-green-50/30" : "hover:shadow-md"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{integration.icon}</span>
                  {isConnected ? (
                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-green-200">Connected</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">{integration.authType}</Badge>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold">{integration.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{integration.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{integration.category}</Badge>
                </div>
                <div className="mt-3">
                  {isConnected ? (
                    <Button variant="outline" size="sm" onClick={() => handleDisconnect(integration.id)} className="w-full gap-1.5 text-red-500 border-red-200 hover:bg-red-50">
                      <PowerOff className="h-3 w-3" /> Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(integration.id)} className="w-full gap-1.5">
                      <Plug className="h-3 w-3" /> Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
