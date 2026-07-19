"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/hooks/use-app-store"
import { Search, ShoppingBag, Users, Zap, ArrowRight, Check, Sparkles } from "lucide-react"
import Link from "next/link"
import type { AgentTemplate } from "@/types"
import { TEMPLATE_CATALOG, TEMPLATE_CATEGORIES } from "@/lib/templates/catalog"

const TEMPLATES: AgentTemplate[] = TEMPLATE_CATALOG
const CATEGORIES = TEMPLATE_CATEGORIES

export default function MarketplacePage() {
  const addToast = useAppStore((s) => s.addToast)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [cloningId, setCloningId] = useState<string | null>(null)

  const filtered = TEMPLATES.filter((t) => {
    const m = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
    const c = category === "All" || t.category === category
    return m && c
  })

  const handleClone = async (template: AgentTemplate) => {
    setCloningId(template.id)
    try {
      const res = await fetch("/api/agents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: template.name, role: template.role, emoji: template.emoji, color: template.color, description: template.description, system_prompt: template.system_prompt, triggers: template.triggers, template_id: template.id }),
      })
      if (!res.ok) throw new Error("Failed to clone")
      addToast(`${template.emoji} ${template.name} added to your roster!`, "success")
    } catch (err) { addToast(err instanceof Error ? err.message : "Failed", "error") }
    finally { setCloningId(null) }
  }

  return (
    <div className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="font-heading text-4xl font-bold">Agent Marketplace</h1>
            </div>
            <p className="text-muted-foreground">Build your team from proven agent templates — clone with one click.</p>
          </div>
          <Link href="/dashboard/agents">
            <Button variant="outline" className="gap-2"><ArrowRight className="h-4 w-4" /> My Roster</Button>
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <input className="input-field pl-11" placeholder="Search by name, role, or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const count = cat === "All" ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === cat).length
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  category === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-charcoal-light border border-border/50 hover:border-primary/30 hover:shadow-sm"
                }`}>
                {cat} <span className="opacity-60">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <Card key={template.id} className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-[0.08]" style={{ backgroundColor: template.color }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm" style={{ backgroundColor: template.color + "12" }}>
                    {template.emoji}
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{template.category}</Badge>
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{template.name}</h3>
                <p className="text-xs font-medium text-charcoal-light uppercase tracking-wider">{template.role}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {template.triggers?.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] border-border/60">{t}</Badge>
                  ))}
                  {(template.triggers?.length || 0) > 3 && <Badge variant="outline" className="text-[10px]">+{template.triggers!.length - 3}</Badge>}
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {template.use_count} teams
                  </div>
                  <Button size="sm" onClick={() => handleClone(template)} disabled={cloningId === template.id} className="gap-1.5 shadow-sm">
                    {cloningId === template.id ? "Adding..." : <><Zap className="h-3.5 w-3.5" /> Clone</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-16 text-center mt-8">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No templates match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
