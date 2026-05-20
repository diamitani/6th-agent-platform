"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Library, BookOpen, Target, MessageSquare, Brain, TrendingUp, Sparkles } from "lucide-react"

export default function HubPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold">Reference Hub</h1>
            <p className="text-muted-foreground">Your org&apos;s persistent knowledge, decisions, and timeline</p>
          </div>
        </div>
        <Tabs defaultValue="identity">
          <TabsList><TabsTrigger value="identity" className="gap-2"><BookOpen className="h-4 w-4" />Identity</TabsTrigger><TabsTrigger value="knowledge" className="gap-2"><Brain className="h-4 w-4" />Knowledge</TabsTrigger><TabsTrigger value="timeline" className="gap-2"><TrendingUp className="h-4 w-4" />Timeline</TabsTrigger></TabsList>
          <TabsContent value="identity" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Org Identity</CardTitle><CardDescription>Who you are, who you serve, how you position</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Target, label: "Mission / Identity", placeholder: "What does your organization do?" },
                  { icon: BookOpen, label: "Ideal Customer Profile", placeholder: "Who do you serve?" },
                  { icon: MessageSquare, label: "Positioning / Messaging", placeholder: "How do you talk about yourself?" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-parchment-dark p-5">
                    <div className="flex items-center gap-2 mb-2"><s.icon className="h-4 w-4 text-primary" /><h4 className="text-sm font-semibold">{s.label}</h4></div>
                    <p className="text-sm text-muted-foreground italic">{s.placeholder}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="knowledge"><Card><CardContent className="flex flex-col items-center justify-center p-12 text-center"><Library className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">Add KB docs to see them here</p></CardContent></Card></TabsContent>
          <TabsContent value="timeline"><Card><CardContent className="flex flex-col items-center justify-center p-12 text-center"><TrendingUp className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">Agent actions appear here as they work</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
