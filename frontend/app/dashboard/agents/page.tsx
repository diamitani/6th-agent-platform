"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, MessageSquare, Settings, Sparkles, Search, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AgentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Agent Roster</h1>
            <p className="mt-1 text-muted-foreground">Your team of AI agents — ready to work</p>
          </div>
          <div className="flex gap-3">
            <Link href="/marketplace">
              <Button variant="outline" className="gap-2"><Sparkles className="h-4 w-4" /> Browse Marketplace</Button>
            </Link>
            <Link href="/dashboard/builder">
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Agent</Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input className="input-field pl-11" placeholder="Search agents by name, role, or trigger..." />
        </div>

        {/* Empty State */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/20 p-16 text-center">
          <div className="orb orb-primary w-80 h-80 -top-40 -right-40 opacity-20" />
          <div className="relative z-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-gradient-subtle">
              <Bot className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="mt-6 font-heading text-2xl font-bold">No agents yet</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Create your first agent from scratch, or browse the marketplace for proven templates.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/dashboard/builder">
                <Button className="gap-2 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" /> Create Agent</Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" className="gap-2">Browse Marketplace <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
