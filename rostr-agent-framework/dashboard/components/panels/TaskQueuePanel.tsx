"use client"

import { ListTodo, AlertCircle, Clock } from "lucide-react"

export function TaskQueuePanel() {
  const tasks = [
    {
      id: "1",
      description: "Research Stripe subscription API",
      phase: "pred",
      priority: 8.5,
      agent: "research-assistant",
      status: "in_progress",
      phaseColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
    },
    {
      id: "2",
      description: "Implement JWT authentication",
      phase: "development",
      priority: 7.2,
      agent: "code-builder",
      status: "in_progress",
      phaseColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    },
    {
      id: "3",
      description: "Design pricing page wireframe",
      phase: "design",
      priority: 6.8,
      agent: "unallocated",
      status: "queued",
      phaseColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    },
    {
      id: "4",
      description: "Fix login redirect bug",
      phase: "debugging",
      priority: 9.1,
      agent: "code-builder",
      status: "queued",
      phaseColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-purple-500" />
          NPAO Task Queue
        </h2>
        <span className="text-xs text-gray-500">Priority-sorted</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${task.phaseColor}`}>
                    {task.phase.toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                    P{task.priority.toFixed(1)}
                  </span>
                  {task.status === 'in_progress' && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Clock className="w-3 h-3 animate-spin" />
                      Active
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.description}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {task.agent !== 'unallocated' ? (
                    <span>Assigned to: {task.agent}</span>
                  ) : (
                    <span className="text-orange-600 dark:text-orange-400">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Unallocated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs">
        <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
          Priority Calculation:
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          Phase Urgency × 0.35 + Dependency × 0.30 + Business × 0.25 + Resource × 0.10
        </div>
      </div>
    </div>
  )
}
