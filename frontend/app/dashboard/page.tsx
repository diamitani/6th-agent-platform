"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, MessageSquare, BookOpen, TrendingUp, Zap, ArrowRight, Sparkles, Activity, Users, ChevronRight, Compass, Target, Layers, Brain } from "lucide-react"
import Link from "next/link"
import {
  PHASE_LABELS, PHASE_DESCRIPTIONS, calculateNPAOScore, getPhaseUrgency, getPriorityLabel, getPriorityColor,
  ROSTR_POSITIONING,
  type Phase5D
} from "@/lib/rostr"

const stats = [
  { label: "Active Agents", value: "0", icon: Bot, color: "#FF6B00", change: "+0 this week" },
  { label: "Chat Threads", value: "0", icon: MessageSquare, color: "#2563EB", change: "+0 today" },
  { label: "Knowledge Docs", value: "0", icon: BookOpen, color: "#F5C100", change: "0 added" },
  { label: "Tasks Completed", value: "0", icon: TrendingUp, color: "#059669", change: "this week" },
]

const PHASES: { id: Phase5D; score: number }[] = [
  { id: "pred", score: calculateNPAOScore({ phase_urgency: getPhaseUrgency("pred"), dependency_impact: 3, business_impact: 5, resource_efficiency: 8 }) },
  { id: "design", score: calculateNPAOScore({ phase_urgency: getPhaseUrgency("design"), dependency_impact: 4, business_impact: 6, resource_efficiency: 6 }) },
  { id: "development", score: calculateNPAOScore({ phase_urgency: getPhaseUrgency("development"), dependency_impact: 6, business_impact: 7, resource_efficiency: 4 }) },
  { id: "deployment", score: calculateNPAOScore({ phase_urgency: getPhaseUrgency("deployment"), dependency_impact: 5, business_impact: 8, resource_efficiency: 3 }) },
  { id: "debugging", score: calculateNPAOScore({ phase_urgency: getPhaseUrgency("debugging"), dependency_impact: 7, business_impact: 9, resource_efficiency: 2 }) },
]

export default function DashboardPage() {
  const [activePhase, setActivePhase] = useState<Phase5D>("pred")
  const active = PHASES.find((p) => p.id === activePhase)!

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header — ROSTR positioned */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold">NPAO Canvas</h1>
              <Badge variant="gold" className="text-xs font-semibold gap-1.5">
                <Sparkles className="mr-1 h-3 w-3" />v1.0 — ROSTR Engine
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground flex items-center gap-2">
              <span className="text-[10px] font-mono bg-charcoal/5 px-1.5 py-0.5 rounded">{ROSTR_POSITIONING.fpe}</span>
              Navigate · Prioritize · Allocate · Orchestrate
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/guide"><Button variant="outline" className="gap-2"><Compass className="h-4 w-4" /> Workflow Guide</Button></Link>
            <Link href="/dashboard/chat"><Button className="gap-2"><Zap className="h-4 w-4" /> Quick Chat</Button></Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-5" style={{ backgroundColor: stat.color }} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl p-3" style={{ backgroundColor: stat.color + "10" }}>
                    <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{stat.change}</Badge>
                </div>
                <p className="mt-4 font-heading text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 5D Phase Taxonomy — ROSTR Core */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-[#FF6B00]" />
                5D Phase Taxonomy
              </CardTitle>
              <CardDescription>Phase-aware orchestration — gate enforcement prevents skipping research</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PHASES.map((phase) => {
                  const isActive = phase.id === activePhase
                  return (
                    <button key={phase.id} onClick={() => setActivePhase(phase.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        isActive ? "border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-sm" : "border-border/40 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${getPriorityColor(phase.score)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{PHASE_LABELS[phase.id]}</span>
                            <Badge variant={phase.score >= 7 ? "destructive" : phase.score >= 4 ? "default" : "secondary"} className="text-[10px]">
                              {getPriorityLabel(phase.score)} ({phase.score.toFixed(1)})
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{PHASE_DESCRIPTIONS[phase.id]}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    </button>
                  )
                })}
              </div>
              {active && (
                <div className="mt-4 rounded-xl bg-[#FF6B00]/5 border border-[#FF6B00]/20 p-4 text-sm">
                  <p className="font-semibold text-[#FF6B00]">Current Phase: {PHASE_LABELS[active.id]}</p>
                  <p className="text-xs text-muted-foreground mt-1">Priority Score: {active.score.toFixed(1)} — {getPriorityLabel(active.score)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Commands */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-[#FF6B00]" />
                  Quick Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { trigger: "/triage", desc: "Run NPAO triage — check all agents", color: "border-[#FF6B00]/20 bg-[#FF6B00]/5" },
                    { trigger: "/status", desc: "Full weekly report", color: "border-blue-500/20 bg-blue-500/5" },
                    { trigger: "/ship", desc: "Enter FPE loop — ship, test, fix", color: "border-green-500/20 bg-green-500/5" },
                    { trigger: "/research", desc: "Launch RAG DAL investigation", color: "border-purple-500/20 bg-purple-500/5" },
                  ].map((cmd) => (
                    <div key={cmd.trigger} className={`flex items-center gap-3 rounded-xl border ${cmd.color} p-3 transition-all hover:shadow-sm`}>
                      <code className="rounded-lg bg-charcoal/80 px-2.5 py-1.5 font-mono text-xs text-gold whitespace-nowrap">{cmd.trigger}</code>
                      <span className="text-xs text-muted-foreground">{cmd.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-green-500" />
                  FPE Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    { step: "Finish", desc: "Complete current artifact", done: false },
                    { step: "Process", desc: "PAL → Plan → Reference → Build", done: false },
                    { step: "Effective", desc: "Production-ready output", done: false },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3 rounded-lg bg-parchment-dark p-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${s.done ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                      <div>
                        <p className="text-xs font-semibold">{s.step}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
