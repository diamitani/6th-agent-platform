"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, MessageSquare, BookOpen, TrendingUp, Zap, ArrowRight, Sparkles, Activity, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Active Agents", value: "0", icon: Bot, color: "#C0272D", change: "+0 this week" },
  { label: "Chat Threads", value: "0", icon: MessageSquare, color: "#2563EB", change: "+0 today" },
  { label: "Knowledge Docs", value: "0", icon: BookOpen, color: "#F5C100", change: "0 added" },
  { label: "Tasks Completed", value: "0", icon: TrendingUp, color: "#059669", change: "this week" },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold">NPAO Canvas</h1>
              <Badge variant="gold" className="text-xs font-semibold">
                <Sparkles className="mr-1 h-3 w-3" />Phase: PreD
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">Your command center — prioritize, allocate, orchestrate.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/builder">
              <Button variant="outline" className="gap-2"><Bot className="h-4 w-4" /> New Agent</Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button className="gap-2"><Zap className="h-4 w-4" /> Quick Chat</Button>
            </Link>
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
          {/* Quick Commands */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-gold" />
                Quick Commands
              </CardTitle>
              <CardDescription>Trigger your agents with natural language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { trigger: "/triage", desc: "Run NPAO triage — check all agents", color: "from-red-500/10 to-red-500/5 border-red-500/20" },
                  { trigger: "/status", desc: "Get current status of all active agents", color: "from-blue-500/10 to-blue-500/5 border-blue-500/20" },
                  { trigger: "/ship", desc: "Enter Ralph Wiggums Loop — ship current phase", color: "from-green-500/10 to-green-500/5 border-green-500/20" },
                  { trigger: "/research", desc: "Launch research agent on any topic", color: "from-purple-500/10 to-purple-500/5 border-purple-500/20" },
                ].map((cmd) => (
                  <div key={cmd.trigger} className={`flex items-center gap-3 rounded-xl border bg-gradient-to-r ${cmd.color} p-4 transition-all hover:shadow-sm`}>
                    <code className="rounded-lg bg-charcoal/80 px-3 py-1.5 font-mono text-sm text-gold">{cmd.trigger}</code>
                    <span className="text-sm text-muted-foreground flex-1">{cmd.desc}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Active Agents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Agent Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Bot className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No agents yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Create your first agent to get started</p>
                  <Link href="/dashboard/builder">
                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                      <Bot className="h-3.5 w-3.5" /> Create Agent
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Activity className="mb-3 h-10 w-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Activity will appear here as agents work</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
