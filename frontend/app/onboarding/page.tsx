"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/hooks/use-app-store"
import { ArrowRight, Check, Building2, Target, Bot, Sparkles, ChevronRight } from "lucide-react"

const INDUSTRIES = ["Music", "E-commerce", "Agency", "SaaS", "Creator", "Other"]
const GOALS = ["Grow revenue", "Save time", "Build a team", "Ship faster"]
const RECOMMENDED = [
  { id: "t1", name: "Chief of Staff", emoji: "🎯", role: "Orchestrator", desc: "Runs triage, priorities, reports" },
  { id: "t2", name: "Marketing Manager", emoji: "📊", role: "Growth", desc: "Manages campaigns & channels" },
  { id: "t3", name: "Content Writer", emoji: "✍️", role: "Content", desc: "Creates content & copy" },
  { id: "t6", name: "Research Agent", emoji: "🔍", role: "Research", desc: "Market & competitive intel" },
  { id: "t9", name: "Builder Agent", emoji: "🏗️", role: "Dev", desc: "Ships product features" },
  { id: "t5", name: "Social Media", emoji: "📱", role: "Social", desc: "Posts & engagement" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState("")
  const [industry, setIndustry] = useState("")
  const [identity, setIdentity] = useState("")
  const [icp, setIcp] = useState("")
  const [goal, setGoal] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, industry, identity, icp, goal, selectedAgents: selected }),
      })
      if (!res.ok) throw new Error("Failed")
      addToast("🎉 Your agent team is ready!", "success")
      router.push("/dashboard"); router.refresh()
    } catch { addToast("Onboarding failed", "error") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-xl font-bold text-white shadow-xl shadow-primary/30">
            RA
          </div>
          <h1 className="font-heading text-4xl font-bold">Set up your Hub</h1>
          <p className="mt-2 text-muted-foreground">Step {step} of 3</p>
          <div className="mx-auto mt-6 flex w-48 gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-brand-gradient" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="border-t-4 border-t-primary/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Building2 className="h-5 w-5 text-primary" /> Who are you?</CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization name</label>
                <input className="input-field" placeholder="Your company or brand" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">What do you do?</label>
                <Textarea placeholder="Describe your business, mission..." value={identity} onChange={(e) => setIdentity(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={() => setStep(2)} disabled={!orgName} className="w-full gap-2 shadow-lg shadow-primary/20">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-t-4 border-t-gold/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Target className="h-5 w-5 text-gold" /> Who do you serve?</CardTitle>
              <CardDescription>Define your ideal customer and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ideal Customer Profile</label>
                <Textarea placeholder="Describe your target audience — who they are, what they need..." value={icp} onChange={(e) => setIcp(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary goal</label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger><SelectValue placeholder="What's your main objective?" /></SelectTrigger>
                  <SelectContent>{GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!icp} className="flex-1 gap-2">Next <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-t-4 border-t-blue-400/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Bot className="h-5 w-5 text-blue-500" /> Pick your starter team</CardTitle>
              <CardDescription>Select 1-3 agents to clone into your org</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {RECOMMENDED.map((agent) => (
                  <button key={agent.id} onClick={() => setSelected((p) => p.includes(agent.id) ? p.filter((a) => a !== agent.id) : [...p, agent.id])}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      selected.includes(agent.id) ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/50 hover:border-muted-foreground/30 hover:shadow-sm"
                    }`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-parchment-dark text-2xl shadow-sm">{agent.emoji}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.role} — {agent.desc}</p>
                    </div>
                    {selected.includes(agent.id) && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-sm">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleComplete} disabled={selected.length === 0 || loading} className="flex-1 gap-2 shadow-lg shadow-primary/20">
                  {loading ? "Setting up..." : <><Sparkles className="h-4 w-4" /> Launch with {selected.length} agent{selected.length !== 1 ? "s" : ""}</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
