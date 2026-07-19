"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/hooks/use-app-store"
import { Sparkles, Bot, Zap, ArrowLeft, Check, Loader2, MessageSquare, Copy, Puzzle } from "lucide-react"
import Link from "next/link"
import { AGENT_TEMPLATES } from "@/lib/pal/templates"

interface Toolkit {
  slug: string
  name: string
  category: string
  description: string
  logo?: string
  tools_count?: number
}

export default function BuilderPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [prompt, setPrompt] = useState("")
  const [compiling, setCompiling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [step, setStep] = useState<"input" | "review" | "done">("input")
  const [saving, setSaving] = useState(false)
  const [toolkits, setToolkits] = useState<Toolkit[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/composio?limit=24")
      .then((r) => r.json())
      .then((d) => setToolkits(d.items || []))
      .catch(() => setToolkits([]))
  }, [])

  const toggleTool = (slug: string) => {
    setSelectedTools((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const handleCompile = async () => {
    if (!prompt.trim()) return
    setCompiling(true)
    try {
      const res = await fetch("/api/pal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      if (!res.ok) throw new Error("Compilation failed")
      const data = await res.json()
      setResult(data)
      setStep("review")
      addToast("PAL compilation complete", "success")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Compilation failed", "error")
    } finally {
      setCompiling(false)
    }
  }

  const handleSave = async () => {
    if (!result?.manifest) return
    setSaving(true)
    try {
      const m = result.manifest
      const armedToolkits = toolkits.filter((t) => selectedTools.includes(t.slug))
      const arsenalNote = armedToolkits.length
        ? `\n\n## TOOL ARSENAL (via Composio)\nYou are equipped with these integrations: ${armedToolkits
            .map((t) => `${t.name} (${t.slug})`)
            .join(", ")}. Use them when a task requires acting in those systems.`
        : ""
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          role: m.role,
          emoji: m.emoji,
          color: m.color,
          description: m.system_prompt?.split("\n")[0] || "",
          system_prompt: (m.system_prompt || "") + arsenalNote,
          triggers: m.triggers,
          tools: selectedTools,
        }),
      })
      if (!res.ok) throw new Error("Failed to save agent")
      setStep("done")
      addToast(`${m.emoji} ${m.name} is on your roster!`, "success")
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <Bot className="h-7 w-7 text-[#C96442]" />
            <h1 className="font-heading text-3xl font-bold">Agent Builder</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Describe what you need in natural language. PAL compiles it into a working agent.
          </p>
        </div>

        {/* Quick Templates */}
        {step === "input" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {AGENT_TEMPLATES.slice(0, 6).map((t) => (
                <button key={t.id} onClick={() => {
                  setPrompt(`I need an agent for ${t.domain}: ${t.description}`)
                }}
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm transition-all hover:border-[#C96442]/30 hover:shadow-sm">
                  <span className="text-lg">{t.emoji}</span>
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="secondary" className="text-[10px] ml-1">{t.category}</Badge>
                </button>
              ))}
            </div>

            {/* PAL Input */}
            <Card className="border-t-4 border-t-[#C96442]/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-[#C96442]" />
                  PAL Stage 1: Describe what you need
                </div>
                <Textarea
                  placeholder="I need an agent that sends 30 personalized DMs per day on Instagram, LinkedIn, and Twitter. It should follow a 3-touch sequence and require my approval before sending. Track reply rates and flag hot leads for sales."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="text-base"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    PAL will extract: domain, constraints, triggers, output format, and cadence
                  </p>
                  <Button onClick={handleCompile} disabled={!prompt.trim() || compiling} className="gap-2 shadow-lg shadow-[#C96442]/20">
                    {compiling ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Compiling...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Compile Agent</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How PAL works */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs text-muted-foreground">
              {["Intent Extraction", "Context Injection", "Semantic Enhancement", "Runtime Compilation"].map((s, i) => (
                <div key={s} className="rounded-lg bg-parchment-dark p-3">
                  <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#C96442]/10 text-[10px] font-bold text-[#C96442]">{i + 1}</div>
                  <p className="font-medium text-charcoal">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAL Review */}
        {step === "review" && result && (
          <div className="space-y-6">
            <button onClick={() => { setStep("input"); setResult(null) }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-charcoal">
              <ArrowLeft className="h-4 w-4" /> Back to prompt
            </button>

            <Card className="border-t-4 border-t-green-400">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" /> PAL Compilation Complete
                  <Badge variant="secondary" className="text-[10px] ml-1">{result.method}</Badge>
                </div>

                {/* Agent Preview */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-sm" style={{ backgroundColor: result.manifest.color + "15" }}>
                    {result.manifest.emoji}
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold">{result.manifest.name}</h2>
                    <p className="text-sm text-muted-foreground">{result.manifest.role}</p>
                  </div>
                  <Badge variant="gold" className="ml-auto text-xs">PAL Compiled</Badge>
                </div>

                {/* Trigger Words */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">TRIGGER WORDS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.manifest.triggers.map((t: string) => (
                      <Badge key={t} variant="secondary" className="px-3 py-1.5 text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">SYSTEM PROMPT</p>
                  <div className="rounded-xl bg-charcoal p-4 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">{result.manifest.system_prompt}</pre>
                  </div>
                </div>

                {/* Arsenal — Composio tool selection */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">
                      ARM YOUR AGENT — INTEGRATIONS
                    </p>
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Puzzle className="h-3 w-3" /> Composio · {selectedTools.length} selected
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {toolkits.slice(0, 12).map((t) => {
                      const selected = selectedTools.includes(t.slug)
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggleTool(t.slug)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            selected
                              ? "border-[#C96442]/50 bg-[#C96442]/5 shadow-sm"
                              : "border-border/40 bg-card hover:border-[#C96442]/25"
                          }`}
                        >
                          {t.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.logo} alt={t.name} className="h-4 w-4 shrink-0 rounded" />
                          ) : (
                            <Puzzle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                          )}
                          <span className="min-w-0 flex-1 truncate text-xs font-medium">{t.name}</span>
                          {selected && <Check className="h-3.5 w-3.5 shrink-0 text-[#C96442]" />}
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Connected accounts are managed in{" "}
                    <Link href="/dashboard/integrations" className="text-[#C96442] hover:underline">Integrations</Link>.
                    Your agent only acts through tools you arm it with.
                  </p>
                </div>

                {/* PAL Details */}
                {result.enhanced && (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="rounded-lg bg-parchment-dark p-3">
                      <p className="font-semibold text-charcoal">Domain</p>
                      <p className="text-muted-foreground capitalize">{result.enhanced.domain}</p>
                    </div>
                    <div className="rounded-lg bg-parchment-dark p-3">
                      <p className="font-semibold text-charcoal">Urgency</p>
                      <p className="text-muted-foreground capitalize">{result.enhanced.urgency}</p>
                    </div>
                    <div className="rounded-lg bg-parchment-dark p-3">
                      <p className="font-semibold text-charcoal">Clarity</p>
                      <p className="text-muted-foreground">
                        {result.enhanced.ambiguity_score < 0.3 ? "Crystal clear" : result.enhanced.ambiguity_score < 0.6 ? "Some ambiguity" : "Vague — needs refinement"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setStep("input"); setResult(null) }} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Refine
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2 shadow-lg shadow-[#C96442]/20">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Sparkles className="h-4 w-4" /> Add {result.manifest.emoji} {result.manifest.name} to Roster</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Done */}
        {step === "done" && result && (
          <Card className="border-t-4 border-t-green-400 text-center">
            <CardContent className="p-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold">{result.manifest.emoji} {result.manifest.name} is ready</h2>
              <p className="mt-2 text-muted-foreground">Added to your roster with full PAL-compiled system prompt</p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Link href="/dashboard/chat">
                  <Button className="gap-2"><MessageSquare className="h-4 w-4" /> Chat with {result.manifest.name}</Button>
                </Link>
                <Link href="/dashboard/agents">
                  <Button variant="outline">View Roster</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
