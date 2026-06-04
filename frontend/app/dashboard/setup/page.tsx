"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"

const CHANNEL_OPTIONS = [
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "telegram", label: "Telegram", icon: "✈️" },
  { id: "signal", label: "Signal", icon: "🔒" },
  { id: "slack", label: "Slack", icon: "🔷" },
  { id: "teams", label: "Teams", icon: "💼" },
]

const PROVIDER_OPTIONS = [
  { id: "azure", label: "Microsoft Azure", desc: "$200 free credit" },
  { id: "oracle", label: "Oracle Cloud", desc: "Always-free tier" },
  { id: "aws", label: "Amazon Web Services", desc: "12 months free" },
]

export default function OneClickSetupPage() {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState("azure")
  const [instanceName, setInstanceName] = useState("my-6th-agent")
  const [region, setRegion] = useState("us-east-1")
  const [channels, setChannels] = useState<string[]>([])
  const [setupId, setSetupId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleStart = async () => {
    setLoading(true)
    setLog([])
    setStep(5)

    try {
      const data = await apiFetch("/api/setup/start", {
        method: "POST",
        body: JSON.stringify({
          provider,
          name: instanceName,
          region,
          channels,
        }),
      })
      setSetupId(data.setup_id)
      setStatus(data.status)

      if (data.steps) {
        setLog(data.steps.map((s: any) => `${s.status === "completed" ? "✅" : "❌"} ${s.description}`))
      }
    } catch (e: any) {
      setLog((prev) => [...prev, `❌ Error: ${e.message}`])
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">One-Click Setup</h1>
        <p className="text-muted-foreground mt-1">
          Deploy your own 6th Agent instance in minutes. Pick a cloud, add channels, and go.
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 1: Choose Cloud Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROVIDER_OPTIONS.map((p) => (
              <Card
                key={p.id}
                className={`cursor-pointer border-2 transition-all ${
                  provider === p.id ? "border-orange-500" : "border-transparent"
                }`}
                onClick={() => setProvider(p.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{p.label}</CardTitle>
                  <CardDescription>{p.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Instance Name</label>
              <Input value={instanceName} onChange={(e) => setInstanceName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Region</label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>
          <Button onClick={() => setStep(2)}>Next: Connect Channels</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 2: Connect Messaging Channels</h2>
          <p className="text-muted-foreground text-sm">Choose how you want to interact with your agent. You can configure these later too.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHANNEL_OPTIONS.map((ch) => (
              <Card
                key={ch.id}
                className={`cursor-pointer border-2 transition-all ${
                  channels.includes(ch.id) ? "border-orange-500" : "border-transparent"
                }`}
                onClick={() => toggleChannel(ch.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <CardTitle className="text-sm">{ch.label}</CardTitle>
                      <CardDescription className="text-xs">
                        {channels.includes(ch.id) ? "✅ Connected" : "Click to enable"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Next: Instance Type</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 3: Choose Deployment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-orange-500 border-2">
              <CardHeader>
                <CardTitle className="text-lg">☁️ Use Our Hosted Instance</CardTitle>
                <CardDescription>
                  We provision and manage your instance. You get a URL and API key immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">Starting at $29/month</p>
                <Button className="w-full" onClick={handleStart}>🚀 Deploy Now</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔧 Your Own Infrastructure</CardTitle>
                <CardDescription>
                  Deploy on your existing server. We give you the script — you SSH in and paste it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">Free — bring your own server</p>
                <Button variant="outline" className="w-full" onClick={async () => {
                  try {
                    const data = await apiFetch("/api/cloud/deployment-script")
                    await navigator.clipboard.writeText(data.script)
                    setLog(["📋 Deployment script copied to clipboard!", "SSH into your server and paste it."])
                    setStep(5)
                  } catch (e) { console.error(e) }
                }}>
                  📋 Copy Deploy Script
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button variant="ghost" onClick={() => setStep(4)}>Need a cloud account?</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 4: Set Up Your Cloud Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROVIDER_OPTIONS.map((p) => (
              <Card key={p.id} className="cursor-pointer hover:border-orange-500">
                <CardHeader>
                  <CardTitle>{p.label}</CardTitle>
                  <CardDescription>{p.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                      onClick={async () => {
                        try {
                          const data = await apiFetch(`/api/cloud/guided-signup/${p.id}`)
                          setLog(data.steps)
                          window.open(data.signup_url, "_blank")
                        } catch (e) { console.error(e) }
                      }}
                  >
                    Free Sign Up with Affiliate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button variant="ghost" onClick={() => setStep(1)}>Already have an account? Go back</Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Deployment Status</h2>
          <Card>
            <CardContent className="py-6 space-y-2">
              {log.length === 0 && loading && (
                <p className="text-muted-foreground animate-pulse">Setting up your instance...</p>
              )}
              {log.map((entry, i) => (
                <div key={i} className="text-sm font-mono p-2 bg-secondary/50 rounded">{entry}</div>
              ))}
              {setupId && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded text-sm mt-2">
                  Setup ID: {setupId} · Status: {status}
                </div>
              )}
              {setupId && (
                <Button variant="outline" className="mt-2" onClick={() => {
                  setStep(1)
                  setSetupId(null)
                  setLog([])
                  setStatus(null)
                }}>
                  Start Another Setup
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
