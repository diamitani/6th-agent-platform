"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/panels/StatsCards"
import { AgentStatusPanel } from "@/components/panels/AgentStatusPanel"
import { TaskQueuePanel } from "@/components/panels/TaskQueuePanel"
import { RecentActivityPanel } from "@/components/panels/RecentActivityPanel"
import { PALPipeline } from "@/components/panels/PALPipeline"

export default function Home() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeTasks: 0,
    completedToday: 0,
    knowledgeEntries: 0
  })

  useEffect(() => {
    // Fetch stats from API
    // For now, using mock data
    setStats({
      totalAgents: 5,
      activeTasks: 3,
      completedToday: 12,
      knowledgeEntries: 147
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mission Control</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Real-time overview of your Rostr agent team
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PALPipeline />
        <AgentStatusPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskQueuePanel />
        <RecentActivityPanel />
      </div>
    </div>
  )
}
