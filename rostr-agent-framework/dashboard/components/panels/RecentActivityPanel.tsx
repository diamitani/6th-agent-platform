"use client"

import { Activity, CheckCircle, AlertCircle, Zap, Database } from "lucide-react"

export function RecentActivityPanel() {
  const activities = [
    {
      id: "1",
      type: "task_completed",
      icon: CheckCircle,
      iconColor: "text-green-500",
      message: "Task completed: Research competitor pricing",
      agent: "research-assistant",
      time: "2 minutes ago"
    },
    {
      id: "2",
      type: "knowledge_added",
      icon: Database,
      iconColor: "text-blue-500",
      message: "RAG DAL: Added 12 knowledge entries from research",
      agent: "research-assistant",
      time: "3 minutes ago"
    },
    {
      id: "3",
      type: "pal_compilation",
      icon: Zap,
      iconColor: "text-yellow-500",
      message: "PAL compiled: 'Build pricing page' → 4 phases",
      agent: "system",
      time: "5 minutes ago"
    },
    {
      id: "4",
      type: "task_started",
      icon: Activity,
      iconColor: "text-purple-500",
      message: "Task started: Implement JWT authentication",
      agent: "code-builder",
      time: "8 minutes ago"
    },
    {
      id: "5",
      type: "agent_registered",
      icon: CheckCircle,
      iconColor: "text-green-500",
      message: "Agent registered: deploy-manager",
      agent: "system",
      time: "15 minutes ago"
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Recent Activity
        </h2>
        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`mt-0.5 ${activity.iconColor}`}>
              <activity.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 dark:text-white">
                {activity.message}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {activity.agent}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Timeline</span>
          <span className="text-gray-500">Last 30 minutes</span>
        </div>
      </div>
    </div>
  )
}
