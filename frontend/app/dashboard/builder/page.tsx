"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/hooks/use-app-store"
import { Sparkles, Bot, Zap, ArrowLeft, Check, Loader2, MessageSquare, Copy } from "lucide-react"
import Link from "next/link"
import { AGENT_TEMPLATES } from "@/lib/pal/templates"

export default function BuilderPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [prompt, setPrompt] = useState("")
  const [compiling, setCompiling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [step, setStep] = useState<"input" | "review" | "done">("input")
  const [saving, setSaving] = useState(false)

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
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          role: m.role,
          emoji: m.emoji,
          color: m.color,
          description: m.system_prompt?.split("\n")[0] || "",
          system_prompt: m.system_prompt,
          triggers: m.triggers,
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
            <Bot className="h-7 w-7 text-[#FF6B00]" />
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
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-4 py-2.5 text-sm transition-all hover:border-[#FF6B00]/30 hover:shadow-sm">
                  <span className="text-lg">{t.emoji}</span>
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="secondary" className="text-[10px] ml-1">{t.category}</Badge>
                </button>
              ))}
            </div>

            {/* PAL Input */}
            <Card className="border-t-4 border-t-[#FF6B00]/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-[#FF6B00]" />
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
                  <Button onClick={handleCompile} disabled={!prompt.trim() || compiling} className="gap-2 shadow-lg shadow-[#FF6B00]/20">
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
                  <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B00]/10 text-[10px] font-bold text-[#FF6B00]">{i + 1}</div>
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
                  <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2 shadow-lg shadow-[#FF6B00]/20">
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
