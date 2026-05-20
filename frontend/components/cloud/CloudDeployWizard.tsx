"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/hooks/use-app-store"
import { CLOUD_PROVIDERS } from "@/lib/cloud"
import { Cloud, ArrowRight, Check, ExternalLink, Sparkles, DollarSign, Server } from "lucide-react"

export function CloudDeployWizard() {
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<string>("")
  const [region, setRegion] = useState<string>("")
  const [instanceType, setInstanceType] = useState<string>("")
  const [name, setName] = useState("my-agent-instance")
  const [deploying, setDeploying] = useState(false)
  const [result, setResult] = useState<any>(null)

  const selectedProvider = CLOUD_PROVIDERS.find((p) => p.id === provider)

  const handleDeploy = async () => {
    if (!provider || !region || !instanceType) return
    setDeploying(true)
    try {
      const res = await fetch("/api/cloud/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, name, region, instanceType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.deployment)
      setStep(4)
      addToast(`🚀 Deploying to ${selectedProvider?.name}...`, "info")
    } catch (err: any) {
      addToast(err.message || "Deployment failed", "error")
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <Cloud className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold">Cloud Deploy Wizard</h2>
          <p className="text-sm text-muted-foreground">Deploy your agents to Azure, Oracle Cloud, or AWS</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {["Provider", "Region", "Instance", "Deploy"].map((s, i) => (
          <div key={s} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            step > i + 1 ? "bg-green-50 text-green-600 border border-green-200" :
            step === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" :
            "bg-secondary text-muted-foreground"
          }`}>
            {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
            <span className="hidden sm:inline">{s}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Choose Provider</CardTitle>
            <CardDescription>Select your cloud infrastructure provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CLOUD_PROVIDERS.map((p) => (
              <button key={p.id} onClick={() => { setProvider(p.id); setStep(2) }}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                  provider === p.id ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/50 hover:border-muted-foreground/30"
                }`}>
                <span className="text-3xl">{p.logo}</span>
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5 text-primary" /> Select Region</CardTitle>
            <CardDescription>Choose the region closest to your users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                {selectedProvider.regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!region} className="flex-1 gap-2">Next: Instance Type <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Choose Instance</CardTitle>
            <CardDescription>Select the compute size for your deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Instance Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-3">
              {selectedProvider.instances.map((inst) => (
                <button key={inst.instanceType} onClick={() => { setInstanceType(inst.instanceType); setStep(4) }}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                    instanceType === inst.instanceType ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border/50 hover:shadow-sm"
                  }`}>
                  <div>
                    <p className="text-sm font-semibold">{inst.instanceType}</p>
                    <p className="text-xs text-muted-foreground">{inst.vCPU} vCPU · {inst.memory}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${inst.pricePerHour.toFixed(4)}</p>
                    <p className="text-[10px] text-muted-foreground">/hour</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleDeploy} disabled={deploying || !instanceType} className="flex-1 gap-2">
                {deploying ? "Deploying..." : <><Sparkles className="h-4 w-4" /> Deploy to {selectedProvider.name}</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && result && (
        <Card className="border-t-4 border-t-green-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600"><Check className="h-5 w-5" /> Deployment Initiated</CardTitle>
            <CardDescription>Your instance is being provisioned</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-parchment-dark p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="font-semibold">{result.provider}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-semibold">{result.region}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Instance</span><span className="font-semibold">{result.instanceType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Cost</span><span className="font-semibold">${result.estimatedCost}/hr</span></div>
            </div>
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
              <p className="text-xs font-semibold text-gold-foreground mb-2">🎁 Affiliate Partner</p>
              <p className="text-xs text-muted-foreground">Use our affiliate link to get credits and support 6thAgent:</p>
              <a href={result.affiliateUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-charcoal text-white px-3 py-2 text-xs font-medium hover:bg-charcoal-light transition-colors">
                <ExternalLink className="h-3 w-3" /> Get Free Credits <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
