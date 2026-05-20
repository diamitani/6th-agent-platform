"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowRight, Check, Sparkles, Bot, Cloud, Puzzle, Code, Layers, Zap, Shield } from "lucide-react"
import Link from "next/link"

const STEPS = [
  { icon: Bot, title: "Create Your Agent", desc: "Define its role, system prompt, and triggers in the Agent Builder.", link: "/dashboard/builder", color: "text-primary" },
  { icon: Layers, title: "Build a Workflow", desc: "Use the Canvas to design your agent's step-by-step process flow.", link: "/dashboard/canvas", color: "text-purple-500" },
  { icon: Puzzle, title: "Connect Integrations", desc: "Wire up MCP services via OAuth — your agent gets real tools.", link: "/dashboard/integrations", color: "text-blue-500" },
  { icon: Code, title: "Customize Logic", desc: "Use the built-in IDE to write custom handler functions and tools.", link: "/dashboard/ide", color: "text-green-500" },
  { icon: Cloud, title: "Deploy to Cloud", desc: "Deploy your agent to Azure, Oracle, or AWS with one click.", link: "/dashboard/deploy", color: "text-gold" },
  { icon: Zap, title: "Ship & Iterate", desc: "FPE loop: Ship → Test → Feedback → Fix. Never stop improving.", link: "/dashboard", color: "text-orange-500" },
]

export function WorkflowGuide() {
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-primary/20">
            <BookOpen className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">Workflow Guide</h2>
            <p className="text-sm text-muted-foreground">Your 6-step path to a running agent team</p>
          </div>
        </div>
        <Badge variant="gold" className="text-xs">{completed.size}/{STEPS.length} complete</Badge>
      </div>

      <div className="grid gap-3">
        {STEPS.map((step, i) => {
          const isDone = completed.has(i)
          return (
            <Link key={i} href={step.link}>
              <div className={`group flex items-center gap-4 rounded-xl border p-5 transition-all ${
                isDone ? "border-green-200 bg-green-50/30" : "border-border/50 bg-card hover:shadow-md hover:border-primary/30"
              }`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isDone ? "bg-green-100" : "bg-parchment-dark"} transition-all group-hover:scale-105`}>
                  {isDone ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isDone ? "text-green-700" : ""}`}>
                      {isDone ? `${step.title} — Complete` : step.title}
                    </span>
                    {!isDone && i === 0 && <Badge variant="gold" className="text-[10px]">Next</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
                <ArrowRight className={`h-4 w-4 ${isDone ? "text-green-400" : "text-muted-foreground/30 group-hover:text-primary transition-colors"}`} />
                {!isDone && (
                  <button onClick={(e) => { e.preventDefault(); setCompleted((p) => new Set(p).add(i)) }}
                    className="btn-ghost-icon p-1.5 text-muted-foreground/40 hover:text-green-500">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {completed.size === STEPS.length && (
        <Card className="border-t-4 border-t-gold bg-gradient-to-br from-gold/5 to-gold/0">
          <CardContent className="p-6 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-gold" />
            <h3 className="font-heading text-lg font-bold text-gold-foreground">All steps complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">Your agent team is ready. Enter the Ralph Wiggums Loop — ship and iterate.</p>
            <Link href="/dashboard">
              <Button variant="gold" className="mt-4 gap-2">Go to Dashboard <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
