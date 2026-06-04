"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AGENTS = [
  { id: "engineering", name: "Engineering Lead", color: "bg-blue-500", icon: "⚙️" },
  { id: "ai", name: "AI/ML Architect", color: "bg-purple-500", icon: "🤖" },
  { id: "design", name: "Design Lead", color: "bg-pink-500", icon: "🎨" },
  { id: "development", name: "Development Lead", color: "bg-green-500", icon: "💻" },
  { id: "backend", name: "Backend Architect", color: "bg-amber-500", icon: "🖥️" },
  { id: "frontend", name: "Frontend Architect", color: "bg-cyan-500", icon: "🎭" },
  { id: "product", name: "Product Manager", color: "bg-orange-500", icon: "📋" },
  { id: "devops", name: "DevOps Engineer", color: "bg-red-500", icon: "🚀" },
  { id: "qa", name: "QA Lead", color: "bg-teal-500", icon: "✅" },
  { id: "security", name: "Security Engineer", color: "bg-slate-700", icon: "🔒" },
]

const PHASES = [
  { id: "pred", label: "PreD", desc: "Research & Scoping" },
  { id: "design", label: "Design", desc: "Planning & Architecture" },
  { id: "development", label: "Development", desc: "Building & Testing" },
  { id: "deployment", label: "Deployment", desc: "Shipping & Monitoring" },
  { id: "debugging", label: "Debugging", desc: "Investigating & Fixing" },
]

export default function SwarmDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [vision, setVision] = useState("")
  const [workflowDesc, setWorkflowDesc] = useState("")
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)
  const [taskGraph, setTaskGraph] = useState({})
  const [workloads, setWorkloads] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/swarm/runs")
      const data = await res.json()
      setRuns(data)
    } catch (e) { console.error(e) }
  }, [])

  const fetchTaskGraph = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/swarm/tasks")
      setTaskGraph(await res.json())
    } catch (e) { console.error(e) }
  }, [])

  const fetchWorkloads = useCallback(async () => {
    const wl = {}
    for (const agent of AGENTS) {
      try {
        const res = await fetch(`http://localhost:8000/api/swarm/agents/${agent.id}/workload`)
        const data = await res.json()
        wl[agent.id] = data.workload || 0
      } catch (e) { wl[agent.id] = 0 }
    }
    setWorkloads(wl)
  }, [])

  useEffect(() => {
    fetchRuns(); fetchTaskGraph(); fetchWorkloads()
    const interval = setInterval(() => { fetchRuns(); fetchTaskGraph(); fetchWorkloads() }, 5000)
    return () => clearInterval(interval)
  }, [fetchRuns, fetchTaskGraph, fetchWorkloads])

  const handleRunVision = async () => {
    if (!vision.trim()) return
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/swarm/run-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vision }),
      })
      const result = await res.json()
      await fetchRuns()
      setSelectedRun(result.run_id)
      setActiveTab("runs")
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleRunWorkflow = async () => {
    if (!workflowDesc.trim()) return
    setLoading(true)
    try {
      await fetch("http://localhost:8000/api/swarm/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: workflowDesc }),
      })
      await fetchRuns()
      setActiveTab("runs")
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadRun = async (runId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/swarm/runs/${runId}`)
      setSelectedRun(await res.json())
    } catch (e) { console.error(e) }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Swarm Command Center</h1>
        <p className="text-muted-foreground mt-1">
          Orchestrate your 10-agent product team with NPAO swarm intelligence
        </p>
      </div>

      {/* Agent Workload Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Agent Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs">
                <span>{agent.icon}</span>
                <span>{agent.name}</span>
                <span className={`font-bold ${workloads[agent.id] > 2 ? "text-red-500" : workloads[agent.id] > 0 ? "text-amber-500" : "text-green-500"}`}>
                  {workloads[agent.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vision">Run Vision</TabsTrigger>
          <TabsTrigger value="workflow">Quick Workflow</TabsTrigger>
          <TabsTrigger value="runs">Active Runs</TabsTrigger>
          <TabsTrigger value="tasks">Task Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {PHASES.map((phase) => (
              <Card key={phase.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{phase.label}</CardTitle>
                  <CardDescription>{phase.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.values(taskGraph).filter((t) => t.phase === phase.id).length}
                  </div>
                  <p className="text-xs text-muted-foreground">tasks</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(taskGraph)
                      .filter(([, t]) => t.phase === phase.id)
                      .slice(0, 3)
                      .map(([id, t]) => (
                        <Badge key={id} variant="outline" className="text-xs">{t.title?.slice(0, 20)}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" onClick={() => setActiveTab("vision")}>
                  🎯 Run a Product Vision
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" onClick={() => setActiveTab("workflow")}>
                  ⚡ Deploy a Workflow
                </Button>
                <Button variant="outline" className="w-full justify-start text-left">
                  👁️ View All Agents
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Agent Team</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1.5">
                  {AGENTS.map((a) => (
                    <div key={a.id} className="flex items-center gap-1.5 text-xs py-1">
                      <div className={`w-2 h-2 rounded-full ${a.color}`} />
                      <span>{a.icon}</span>
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vision" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Run a Product Vision</CardTitle>
              <CardDescription>
                Describe your product vision and the swarm will decompose it, route it to the right agents, and track execution across all 5D phases.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='Example: "Build a SaaS dashboard where users can connect their Azure, Oracle, or AWS instance to run 6th Agent privately on their servers, with a guided signup flow and affiliate links."'
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                rows={4}
              />
              <Button onClick={handleRunVision} disabled={loading || !vision.trim()}>
                {loading ? "Dispatching to Swarm..." : "🚀 Run Vision"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Workflow</CardTitle>
              <CardDescription>Describe a specific task for the swarm to execute.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Deploy the 6th Agent stack to Azure with monitoring and CI/CD"
                value={workflowDesc}
                onChange={(e) => setWorkflowDesc(e.target.value)}
                rows={3}
              />
              <Button onClick={handleRunWorkflow} disabled={loading || !workflowDesc.trim()}>
                {loading ? "Delegating..." : "⚡ Run Workflow"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Runs</CardTitle>
              <CardDescription>{runs.length} run{runs.length !== 1 ? "s" : ""} in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {runs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No active runs. Submit a vision or workflow above.</p>
              ) : (
                <div className="space-y-2">
                  {runs.map((run) => (
                    <div key={run.run_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => loadRun(run.run_id)}>
                      <div>
                        <p className="text-sm font-medium">{run.vision?.slice(0, 80)}...</p>
                        <p className="text-xs text-muted-foreground">Run {run.run_id?.slice(0, 8)}</p>
                      </div>
                      <Badge>{run.status}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {selectedRun && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Run Details</h3>
                  {selectedRun.tasks && (
                    <div className="space-y-1.5">
                      {Object.entries(selectedRun.tasks).map(([id, task]) => (
                        <div key={id} className="flex items-center justify-between text-xs p-2 bg-secondary rounded">
                          <span>{task.title}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{task.phase}</Badge>
                            <Badge className={
                              task.status === "completed" ? "bg-green-500" :
                              task.status === "in_progress" ? "bg-blue-500" :
                              task.status === "failed" ? "bg-red-500" : ""
                            }>{task.status}</Badge>
                            <span className="text-muted-foreground">{task.agent}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Progress: {selectedRun.progress}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Dependency Graph</CardTitle>
              <CardDescription>All tasks across the swarm, organized by phase</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(taskGraph).length === 0 ? (
                <p className="text-muted-foreground text-sm">No tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {PHASES.map((phase) => {
                    const phaseTasks = Object.entries(taskGraph).filter(([, t]) => t.phase === phase.id)
                    if (phaseTasks.length === 0) return null
                    return (
                      <div key={phase.id}>
                        <h4 className="text-sm font-bold text-orange-600 mb-1">{phase.label} — {phase.desc}</h4>
                        <div className="space-y-1">
                          {phaseTasks.map(([id, t]) => (
                            <div key={id} className="flex items-center justify-between text-xs p-2 border rounded">
                              <div>
                                <span className="font-medium">{t.title}</span>
                                {t.depends_on?.length > 0 && (
                                  <span className="text-muted-foreground ml-2">depends: {t.depends_on.length}</span>
                                )}
                              </div>
                              <div className="flex gap-1.5">
                                {t.agent && <Badge variant="secondary" className="text-xs">{t.agent}</Badge>}
                                <Badge className={
                                  t.status === "completed" ? "bg-green-500" :
                                  t.status === "in_progress" ? "bg-blue-500" :
                                  t.status === "blocked" ? "bg-red-500" :
                                  t.status === "pending" ? "bg-gray-400" : ""
                                }>{t.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
