"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings, User, CreditCard, Key, Sparkles } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account, team, and billing</p>
          </div>
        </div>
        <Card className="border-t-4 border-t-primary/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><User className="h-5 w-5 text-primary" /> Profile</CardTitle><CardDescription>Your account details</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium">Email</label><input className="input-field" placeholder="your@email.com" disabled /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Plan</label><input className="input-field" value="Free" disabled /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Key className="h-5 w-5" /> API Keys</CardTitle><CardDescription>Connect your own AI provider keys</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Gemini API Key</label><input className="input-field" type="password" placeholder="AIza..." /></div>
            <p className="text-xs text-muted-foreground">Bring your own key to use your own quota. Leave blank to use platform defaults.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><CreditCard className="h-5 w-5" /> Billing</CardTitle><CardDescription>Manage your subscription</CardDescription></CardHeader>
          <CardContent>
            <div className="rounded-xl bg-gradient-to-br from-gold/5 to-gold/0 border border-gold/20 p-5">
              <p className="text-sm font-semibold text-gold-foreground">Current Plan: Free</p>
              <p className="text-xs text-muted-foreground mt-1">3 agents, 1 team, 10 KB docs</p>
              <Button variant="gold" size="sm" className="mt-3 gap-2" disabled><Sparkles className="h-3.5 w-3.5" /> Upgrade — Coming Soon</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
