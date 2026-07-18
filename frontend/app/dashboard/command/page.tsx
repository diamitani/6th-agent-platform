"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot, Plus, Zap, ArrowUpRight, Radio, ShieldCheck, Layers,
  BookOpen, Puzzle, Activity, Sparkles, ChevronRight, CircleDot,
} from "lucide-react"
import {
  NPAO_EXECUTION_ORDER, NPAO_META, classifyNPAO,
  type Mission, type NPAOClass,
} from "@/lib/rostr"

// ------------------------------------------------------------------ types

interface RosterAgent {
  id: string
  name: string
  role: string
  emoji: string
  color: string
  status: "active" | "standby"
  triggers?: string[]
}

interface Toolkit {
  slug: string
  name: string
  category: string
  logo?: string
  tools_count?: number
}

// The standing roster shown before the user deploys their own agents —
// the 11 ROSTR master agents, always on call.
const STANDING_ROSTER: RosterAgent[] = [
  { id: "engineering", name: "Engineering Lead", role: "Architecture & trade-offs", emoji: "⚙️", color: "#FF6B00", status: "standby" },
  { id: "product", name: "Product Manager", role: "Vision, roadmap, priorities", emoji: "📋", color: "#2563EB", status: "standby" },
  { id: "design", name: "Design Lead", role: "Brand, UI/UX, systems", emoji: "🎨", color: "#DB2777", status: "standby" },
  { id: "development", name: "Development Lead", role: "Full-stack implementation", emoji: "💻", color: "#059669", status: "standby" },
  { id: "backend", name: "Backend Architect", role: "APIs, data, connectors", emoji: "🖥️", color: "#7C3AED", status: "standby" },
  { id: "frontend", name: "Frontend Architect", role: "Interfaces & real-time UX", emoji: "🎭", color: "#0891B2", status: "standby" },
  { id: "ai", name: "AI/ML Architect", role: "Models, RAG, prompts", emoji: "🤖", color: "#F5C100", status: "standby" },
  { id: "devops", name: "DevOps Engineer", role: "Deploys & infrastructure", emoji: "🚀", color: "#EA580C", status: "standby" },
  { id: "qa", name: "QA Lead", role: "Quality gates & testing", emoji: "✅", color: "#16A34A", status: "standby" },
  { id: "security", name: "Security Engineer", role: "Threats, auth, compliance", emoji: "🔒", color: "#DC2626", status: "standby" },
]

const DEFAULT_MISSIONS: Mission[] = [
  { id: "m1", title: "Connect your first integration (Gmail, HubSpot, Slack…)", npao_class: "necessity", status: "queued", created_at: new Date().toISOString() },
  { id: "m2", title: "Upload brand + ICP docs to the knowledge base", npao_class: "anxiety", status: "queued", created_at: new Date().toISOString() },
  { id: "m3", title: "Deploy your first custom agent from the builder", npao_class: "priority", status: "queued", created_at: new Date().toISOString() },
  { id: "m4", title: "Explore the marketplace for ready-made specialists", npao_class: "opportunity", status: "queued", created_at: new Date().toISOString() },
]

const OPS_SEED = [
  { icon: "◈", text: "ROSTR runtime online — PAL compiler ready", tone: "ok" },
  { icon: "◈", text: "Reference Hub connected — knowledge compounding enabled", tone: "ok" },
  { icon: "◈", text: "NPAO orchestrator active — execution order N → A → P → O", tone: "ok" },
  { icon: "◈", text: "Standing roster on call — 10 master agents", tone: "info" },
]

// ------------------------------------------------------------------ page

export default function CommandCenterPage() {
  const [now, setNow] = useState<Date | null>(null)
  const [agents, setAgents] = useState<RosterAgent[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [newMission, setNewMission] = useState("")
  const [toolkits, setToolkits] = useState<Toolkit[]>([])
  const [toolkitMode, setToolkitMode] = useState<string>("")
  const [feed, setFeed] = useState(OPS_SEED)

  // Live clock
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Roster — user agents from Supabase, standing army as the floor
  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        const own: RosterAgent[] = (d.agents || []).map((a: any) => ({
          id: a.id, name: a.name, role: a.role, emoji: a.emoji || "🤖",
          color: a.color || "#FF6B00", status: "active" as const, triggers: a.triggers,
        }))
        setAgents(own)
        if (own.length > 0) {
          setFeed((f) => [
            { icon: "▸", text: `${own.length} deployed agent${own.length > 1 ? "s" : ""} reporting for duty`, tone: "ok" },
            ...f,
          ])
        }
      })
      .catch(() => setAgents([]))
  }, [])

  // Missions — persisted locally until the org task board is wired
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rostr-missions")
      setMissions(saved ? JSON.parse(saved) : DEFAULT_MISSIONS)
    } catch {
      setMissions(DEFAULT_MISSIONS)
    }
  }, [])

  const persistMissions = useCallback((next: Mission[]) => {
    setMissions(next)
    try { localStorage.setItem("rostr-missions", JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  // Arsenal — Composio toolkits
  useEffect(() => {
    fetch("/api/composio?limit=24")
      .then((r) => r.json())
      .then((d) => { setToolkits(d.items || []); setToolkitMode(d.mode || "") })
      .catch(() => setToolkits([]))
  }, [])

  const addMission = () => {
    const title = newMission.trim()
    if (!title) return
    const mission: Mission = {
      id: `m-${Date.now().toString(36)}`,
      title,
      npao_class: classifyNPAO(title),
      status: "queued",
      created_at: new Date().toISOString(),
    }
    persistMissions([mission, ...missions])
    setNewMission("")
    setFeed((f) => [
      { icon: "▸", text: `Mission classified ${NPAO_META[mission.npao_class].label.toUpperCase()} — "${title.slice(0, 60)}"`, tone: "info" },
      ...f,
    ].slice(0, 30))
  }

  const cycleMission = (id: string) => {
    persistMissions(
      missions.map((m) => {
        if (m.id !== id) return m
        const nextStatus = m.status === "queued" ? "active" : m.status === "active" ? "done" : "queued"
        return { ...m, status: nextStatus }
      })
    )
  }

  const roster = agents.length > 0 ? [...agents, ...STANDING_ROSTER] : STANDING_ROSTER
  const activeCount = roster.filter((a) => a.status === "active").length
  const openMissions = missions.filter((m) => m.status !== "done")
  const byClass = useMemo(() => {
    const map: Record<NPAOClass, Mission[]> = { necessity: [], anxiety: [], priority: [], opportunity: [] }
    for (const m of missions) map[m.npao_class].push(m)
    return map
  }, [missions])

  const stats = [
    { label: "Agents on roster", value: roster.length, sub: `${activeCount} deployed · ${roster.length - activeCount} on call`, icon: Bot },
    { label: "Missions in queue", value: openMissions.length, sub: "ordered N → A → P → O", icon: Layers },
    { label: "Integrations available", value: toolkits.length > 0 ? `${toolkits.length}+` : "—", sub: toolkitMode === "live" ? "Composio · live" : "Composio catalog", icon: Puzzle },
    { label: "Knowledge namespaces", value: 4, sub: "projects · orgs · teams · global", icon: BookOpen },
  ]

  return (
    <DashboardLayout>
      <div className="command-grid-bg -m-6 min-h-screen p-6 md:-m-8 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ============ Command bar ============ */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">Command Center</h1>
                <Badge variant="gold" className="gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> ROSTR
                </Badge>
              </div>
              <p className="mt-1.5 text-muted-foreground">
                Master of the ship. Every agent, every mission, one view — give the order and the runtime executes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="mono-data hidden items-center gap-2 rounded-xl border border-border/50 bg-white/70 px-3.5 py-2 text-xs text-muted-foreground md:flex">
                <Radio className="h-3.5 w-3.5 text-[#FF6B00]" />
                {now ? now.toUTCString().replace("GMT", "UTC") : "—"}
              </div>
              <Link href="/dashboard/builder">
                <Button className="gap-2 shadow-lg shadow-[#FF6B00]/20">
                  <Plus className="h-4 w-4" /> Deploy New Agent
                </Button>
              </Link>
            </div>
          </div>

          {/* ============ System status strip ============ */}
          <div className="command-card flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
            {[
              { label: "Hermes Runtime", ok: true },
              { label: "PAL Compiler", ok: true },
              { label: "NPAO Orchestrator", ok: true },
              { label: "Reference Hub", ok: true },
              { label: "Tool Arsenal", ok: toolkits.length > 0 },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`status-dot ${s.ok ? "bg-emerald-500" : "bg-amber-400"}`} />
                <span className="text-xs font-medium text-charcoal/70">{s.label}</span>
              </div>
            ))}
            <div className="mono-data ml-auto hidden text-[10px] uppercase tracking-widest text-muted-foreground/60 lg:block">
              all systems operational
            </div>
          </div>

          {/* ============ Stats ============ */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="command-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mono-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="mt-2 font-heading text-3xl font-bold">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                  <div className="rounded-xl bg-[#FF6B00]/8 p-2.5">
                    <s.icon className="h-4.5 w-4.5 text-[#FF6B00]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ============ Main grid ============ */}
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">

              {/* ---- Agent roster ---- */}
              <div className="command-card relative p-6">
                <div className="command-rail bg-[#FF6B00]/60" />
                <div className="mb-5 flex items-center justify-between pl-2">
                  <div>
                    <h2 className="font-heading text-xl font-bold">The Roster</h2>
                    <p className="text-xs text-muted-foreground">Your team — deployed agents lead, master specialists stand ready</p>
                  </div>
                  <Link href="/dashboard/agents" className="flex items-center gap-1 text-xs font-medium text-[#FF6B00] hover:underline">
                    Full roster <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid gap-3 pl-2 sm:grid-cols-2">
                  {roster.slice(0, 8).map((a) => (
                    <div key={a.id} className="group flex items-center gap-3.5 rounded-xl border border-border/40 bg-white/60 p-3.5 transition-all hover:border-[#FF6B00]/25 hover:shadow-sm">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm"
                        style={{ backgroundColor: a.color + "14", border: `1px solid ${a.color}25` }}
                      >
                        {a.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{a.name}</p>
                          <span className={`status-dot shrink-0 ${a.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{a.role}</p>
                      </div>
                      <Badge variant={a.status === "active" ? "default" : "secondary"} className="mono-data shrink-0 text-[9px] uppercase tracking-wider">
                        {a.status === "active" ? "deployed" : "on call"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- NPAO mission queue ---- */}
              <div className="command-card relative p-6">
                <div className="command-rail bg-gold/70" />
                <div className="mb-4 flex items-center justify-between pl-2">
                  <div>
                    <h2 className="font-heading text-xl font-bold">Mission Queue</h2>
                    <p className="text-xs text-muted-foreground">
                      NPAO triage — <span className="mono-data">Necessity → Anxiety → Priority → Opportunity</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="mono-data text-[10px]">{openMissions.length} open</Badge>
                </div>

                {/* Add mission */}
                <div className="mb-5 flex gap-2 pl-2">
                  <input
                    value={newMission}
                    onChange={(e) => setNewMission(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMission()}
                    placeholder="Type a mission — it's classified automatically…"
                    className="input-field flex-1 !py-2.5 text-sm"
                  />
                  <Button onClick={addMission} disabled={!newMission.trim()} className="gap-1.5">
                    <Zap className="h-4 w-4" /> Queue
                  </Button>
                </div>

                {/* Four columns */}
                <div className="grid gap-3 pl-2 sm:grid-cols-2 lg:grid-cols-4">
                  {NPAO_EXECUTION_ORDER.map((cls, i) => {
                    const meta = NPAO_META[cls]
                    const items = byClass[cls]
                    return (
                      <div key={cls} className="rounded-xl border border-border/40 bg-white/50 p-3">
                        <div className="mb-2.5 flex items-center gap-2">
                          <span
                            className="mono-data flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ backgroundColor: meta.color }}
                          >
                            {meta.letter}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-none">{meta.label}</p>
                            <p className="mono-data mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground/70">
                              {i + 1} · {meta.signal}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {items.length === 0 && (
                            <p className="rounded-lg border border-dashed border-border/50 p-2 text-center text-[10px] text-muted-foreground/50">clear</p>
                          )}
                          {items.slice(0, 4).map((m) => (
                            <button
                              key={m.id}
                              onClick={() => cycleMission(m.id)}
                              title="Click to advance: queued → active → done"
                              className={`w-full rounded-lg border p-2 text-left text-[11px] leading-snug transition-all hover:shadow-sm ${
                                m.status === "done"
                                  ? "border-border/30 bg-parchment-dark text-muted-foreground/50 line-through"
                                  : m.status === "active"
                                  ? "border-[#FF6B00]/30 bg-[#FF6B00]/5"
                                  : "border-border/40 bg-white"
                              }`}
                            >
                              <span className="flex items-start gap-1.5">
                                <CircleDot className={`mt-0.5 h-3 w-3 shrink-0 ${m.status === "active" ? "text-[#FF6B00]" : "text-muted-foreground/40"}`} />
                                {m.title}
                              </span>
                            </button>
                          ))}
                          {items.length > 4 && (
                            <p className="mono-data text-center text-[9px] text-muted-foreground/60">+{items.length - 4} more</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ============ Right column ============ */}
            <div className="space-y-6">

              {/* ---- Live operations feed ---- */}
              <div className="command-card relative p-6">
                <div className="command-rail bg-emerald-500/60" />
                <div className="mb-4 flex items-center justify-between pl-2">
                  <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                    <Activity className="h-4.5 w-4.5 text-emerald-600" /> Operations
                  </h2>
                  <span className="mono-data flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-emerald-600">
                    <span className="status-dot bg-emerald-500" /> live
                  </span>
                </div>
                <div className="space-y-1 pl-2">
                  {feed.slice(0, 9).map((e, i) => (
                    <div key={`${e.text}-${i}`} className="animate-feed-in flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs hover:bg-parchment-dark/60">
                      <span className={`mono-data mt-px shrink-0 ${e.tone === "ok" ? "text-emerald-600" : "text-[#FF6B00]"}`}>{e.icon}</span>
                      <span className="text-charcoal/75">{e.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- Arsenal ---- */}
              <div className="command-card relative p-6">
                <div className="command-rail bg-[#2563EB]/50" />
                <div className="mb-4 flex items-center justify-between pl-2">
                  <div>
                    <h2 className="font-heading text-lg font-bold">The Arsenal</h2>
                    <p className="text-xs text-muted-foreground">Tools your agents can wield — powered by Composio</p>
                  </div>
                  <Link href="/dashboard/integrations" className="flex items-center gap-1 text-xs font-medium text-[#FF6B00] hover:underline">
                    Manage <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {toolkits.slice(0, 8).map((t) => (
                    <div key={t.slug} className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-white/60 px-3 py-2.5 transition-all hover:border-[#FF6B00]/25">
                      {t.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.logo} alt={t.name} className="h-5 w-5 shrink-0 rounded" />
                      ) : (
                        <Puzzle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{t.name}</p>
                        {typeof t.tools_count === "number" && (
                          <p className="mono-data text-[9px] text-muted-foreground/70">{t.tools_count} actions</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {toolkits.length === 0 &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="shimmer h-11 rounded-xl border border-border/30" />
                    ))}
                </div>
              </div>

              {/* ---- Quick directives ---- */}
              <div className="command-card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
                  <Sparkles className="h-4.5 w-4.5 text-gold" /> Directives
                </h2>
                <div className="space-y-2">
                  {[
                    { href: "/dashboard/builder", label: "Build a specialist agent", desc: "Describe it — PAL compiles it" },
                    { href: "/dashboard/knowledge", label: "Grow the knowledge base", desc: "Every doc compounds across agents" },
                    { href: "/dashboard/swarm", label: "Run a swarm mission", desc: "Point the whole team at one goal" },
                    { href: "/marketplace", label: "Recruit from the marketplace", desc: "Proven templates, one-click clone" },
                  ].map((d) => (
                    <Link
                      key={d.href}
                      href={d.href}
                      className="group flex items-center gap-3 rounded-xl border border-border/40 bg-white/60 p-3 transition-all hover:border-[#FF6B00]/30 hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#FF6B00]" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
