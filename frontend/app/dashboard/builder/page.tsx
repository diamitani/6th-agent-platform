"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/hooks/use-app-store"
import { Plus, X, Sparkles, Bot, Brain, Zap, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

const EMOJIS = ["🤖", "🎯", "📊", "✍️", "💬", "📱", "🔥", "🔍", "💰", "🤝", "🏗️", "🧠", "🎨", "📈", "⚡", "🎵", "🎬", "👥"]
const COLORS = ["#C0272D", "#2563EB", "#059669", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D"]

export default function BuilderPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [emoji, setEmoji] = useState("🤖")
  const [color, setColor] = useState("#C0272D")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [trigger, setTrigger] = useState("")
  const [triggers, setTriggers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const addTrigger = () => {
    const t = trigger.trim()
    if (t && !triggers.includes(t)) { setTriggers([...triggers, t]); setTrigger("") }
  }

  const handleSave = async () => {
    if (!name || !role) { addToast("Name and role are required", "error"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, emoji, color, description, system_prompt: systemPrompt, triggers }),
      })
      if (!res.ok) throw new Error("Failed to create agent")
      addToast(`${emoji} ${name} is on your roster!`, "success")
      setName(""); setRole(""); setSystemPrompt(""); setTriggers([]); setStep(1)
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed", "error")
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-ghost-icon">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="font-heading text-3xl font-bold">Agent Builder</h1>
            <p className="mt-1 text-muted-foreground">Create a new AI agent for your team</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              s === step ? "bg-primary text-white shadow-lg shadow-primary/20" :
              s < step ? "bg-green-50 text-green-600 border border-green-200" :
              "bg-secondary text-muted-foreground"
            }`}>
              {s < step ? <Check className="h-3.5 w-3.5" /> : s}
              <span className="hidden sm:inline">{s === 1 ? "Identity" : s === 2 ? "Brain" : "Triggers"}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <Card className="border-t-4 border-t-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Bot className="h-5 w-5 text-primary" /> Identity</CardTitle>
              <CardDescription>Who is this agent? Define its name, role, and personality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Icon</label>
                  <Select value={emoji} onValueChange={setEmoji}>
                    <SelectTrigger className="h-16 w-20 text-3xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EMOJIS.map((e) => (<SelectItem key={e} value={e}><span className="text-2xl">{e}</span></SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setColor(c)}
                        className={`h-9 w-9 rounded-xl transition-all ${color === c ? "ring-2 ring-charcoal ring-offset-2 scale-110" : "ring-1 ring-transparent hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input className="input-field" placeholder="e.g. Marketing Manager" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <input className="input-field" placeholder="e.g. Marketing & Growth" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="What does this agent do? Keep it to 1-2 sentences." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
              <Button onClick={() => setStep(2)} disabled={!name || !role} className="w-full gap-2">
                Next: Brain <Zap className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Brain */}
        {step === 2 && (
          <Card className="border-t-4 border-t-gold/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Brain className="h-5 w-5 text-gold" /> Brain</CardTitle>
              <CardDescription>System prompt — how this agent thinks and acts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt</label>
                <Textarea placeholder={`You are the [Role] for [Organization]. You handle [key responsibilities]. Always output [format].`}
                  value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={10} className="font-mono text-sm" />
              </div>
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">
                <p className="font-medium text-gold-foreground">Pro tip</p>
                <p className="mt-1 text-muted-foreground">Include identity, responsibilities, output format, and guardrails. Be specific.</p>
              </div>
              <Button onClick={() => setStep(3)} disabled={!systemPrompt} className="w-full gap-2">
                Next: Triggers <Zap className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Triggers */}
        {step === 3 && (
          <Card className="border-t-4 border-t-blue-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Zap className="h-5 w-5 text-blue-500" /> Triggers</CardTitle>
              <CardDescription>Keywords that activate this agent when mentioned.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-2">
                <input className="input-field flex-1" placeholder="e.g. Marketing, Campaign, Growth"
                  value={trigger} onChange={(e) => setTrigger(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTrigger())} />
                <Button variant="outline" onClick={addTrigger} type="button"><Plus className="h-4 w-4" /></Button>
              </div>
              {triggers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {triggers.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                      {t}
                      <button onClick={() => setTriggers(triggers.filter((x) => x !== t))} className="ml-0.5 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2 shadow-lg shadow-primary/20">
                  {saving ? "Creating..." : <><Sparkles className="h-4 w-4" /> Create Agent</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
