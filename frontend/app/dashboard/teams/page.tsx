"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, Bot, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function TeamsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="font-heading text-3xl font-bold">Teams</h1>
            </div>
            <p className="text-muted-foreground">Group agents into functional teams</p>
          </div>
          <Button disabled className="gap-2"><Plus className="h-4 w-4" /> New Team</Button>
        </div>
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-parchment-dark"><Users className="h-8 w-8 text-muted-foreground/30" /></div>
            <h3 className="mt-4 font-heading text-xl font-bold">No teams yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">Teams let you organize agents by function. Create agents first, then group them.</p>
            <Link href="/dashboard/builder"><Button variant="outline" className="mt-4 gap-2"><Bot className="h-4 w-4" /> Create an Agent</Button></Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
