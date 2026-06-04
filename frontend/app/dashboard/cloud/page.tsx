"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PROVIDERS = [
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: "🔵",
    color: "border-blue-500",
    description: "Enterprise-grade cloud with 12 months free",
  },
  {
    id: "oracle",
    name: "Oracle Cloud",
    icon: "🟠",
    color: "border-orange-500",
    description: "Always-free tier with 2 AMD VMs",
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    icon: "🟡",
    color: "border-amber-400",
    description: "Broadest cloud platform, 12 months free tier",
  },
]

export default function CloudDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [instances, setInstances] = useState([])
  const [pricing, setPricing] = useState([])
  const [name, setName] = useState("my-6th-agent")
  const [region, setRegion] = useState("us-east-1")
  const [selectedProvider, setSelectedProvider] = useState("azure")
  const [deployScript, setDeployScript] = useState("")
  const [affiliateLinks, setAffiliateLinks] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchInstances()
    fetchPricing()
    fetchDeployScript()
    fetchAffiliateLinks()
  }, [])

  const fetchInstances = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/cloud/instances")
      setInstances(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchPricing = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/cloud/pricing")
      setPricing(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchDeployScript = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/cloud/deployment-script")
      const data = await res.json()
      setDeployScript(data.script || "")
    } catch (e) { console.error(e) }
  }

  const fetchAffiliateLinks = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/cloud/affiliate-links")
      setAffiliateLinks(await res.json())
    } catch (e) { console.error(e) }
  }

  const handleProvision = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("http://localhost:8000/api/cloud/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, name, region, use_existing: true }),
      })
      const result = await res.json()
      setMessage(`✅ Provisioned! Instance ID: ${result.instance_id}`)
      await fetchInstances()
    } catch (e) {
      setMessage(`❌ Error: ${e.message}`)
    }
    setLoading(false)
  }

  const handleTerminate = async (instanceId) => {
    try {
      await fetch("http://localhost:8000/api/cloud/terminate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instance_id: instanceId }),
      })
      await fetchInstances()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cloud Instance Manager</h1>
        <p className="text-muted-foreground mt-1">
          Deploy 6th Agent on your own cloud infrastructure. Private, secure, fully managed by you.
        </p>
      </div>

      {message && (
        <div className="p-4 border rounded-lg bg-secondary/50 text-sm">{message}</div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deploy">Deploy an Instance</TabsTrigger>
          <TabsTrigger value="instances">My Instances</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Signup</TabsTrigger>
          <TabsTrigger value="script">Deployment Script</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROVIDERS.map((p) => (
              <Card key={p.id} className={`border-t-4 ${p.color}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{p.icon}</span>
                    {p.name}
                  </CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setSelectedProvider(p.id)
                    setActiveTab("deploy")
                  }}>
                    Deploy on {p.name.split(" ")[0]}
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => {
                    window.open(affiliateLinks[p.id], "_blank")
                  }}>
                    Free Signup (with affiliate)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Active Instances</CardTitle></CardHeader>
            <CardContent>
              {instances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No instances deployed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {instances.map((inst) => (
                    <div key={inst.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div>
                        <span className="font-medium">{inst.name}</span>
                        <span className="text-muted-foreground ml-2">{inst.provider}</span>
                      </div>
                      <Badge>{inst.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy an Instance</CardTitle>
              <CardDescription>Choose your cloud provider and deploy 6th Agent with one click.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {PROVIDERS.map((p) => (
                  <Button
                    key={p.id}
                    variant={selectedProvider === p.id ? "default" : "outline"}
                    onClick={() => setSelectedProvider(p.id)}
                    className="flex-1"
                  >
                    {p.icon} {p.name.split(" ")[0]}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Instance Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Region</label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-secondary/30">
                <h4 className="text-sm font-medium mb-1">Deployment Options</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="deploy-option" defaultChecked className="radio" />
                    <span><strong>Use existing instance</strong> — SSH into your own server and paste the deployment script</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="deploy-option" className="radio" />
                    <span><strong>Generate new instance</strong> — We provision a new VM. You manage it from here.</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="deploy-option" className="radio" />
                    <span><strong>Guided signup</strong> — Walk through free account creation (with affiliate), then deploy</span>
                  </label>
                </div>
              </div>

              <Button onClick={handleProvision} disabled={loading} className="w-full">
                {loading ? "Provisioning..." : `🚀 Deploy on ${PROVIDERS.find((p) => p.id === selectedProvider)?.name.split(" ")[0]}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Instances</CardTitle>
              <CardDescription>{instances.length} instance{instances.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              {instances.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No instances deployed yet.</p>
                  <Button onClick={() => setActiveTab("deploy")}>Deploy Your First Instance</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {instances.map((inst) => (
                    <div key={inst.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{inst.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {inst.provider} · {inst.region} · {inst.id?.slice(0, 16)}
                        </p>
                        {inst.ip_address && <p className="text-xs font-mono mt-1">{inst.ip_address}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={inst.status === "running" ? "bg-green-500" : ""}>{inst.status}</Badge>
                        <Button variant="destructive" size="sm" onClick={() => handleTerminate(inst.id)}>
                          Terminate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Provider Pricing</CardTitle>
              <CardDescription>Compare free tiers and sign up with our affiliate links.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pricing.map((p, i) => (
                  <Card key={i} className="border-t-4 border-t-orange-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{p.provider}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p><strong>Compute:</strong> {p.compute}</p>
                      <p><strong>Storage:</strong> {p.storage}</p>
                      <p><strong>Free Tier:</strong> {p.free_tier}</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(p.signup_url || p.affiliate_url, "_blank")}>
                        Sign Up Free
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="script" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>One-Click Deployment Script</CardTitle>
              <CardDescription>SSH into your server and paste this command to deploy 6th Agent.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-black text-green-400 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                {deployScript || "Loading..."}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigator.clipboard.writeText(deployScript)}
              >
                Copy Script
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
