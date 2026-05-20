"use client"

import { Bot, Circle } from "lucide-react"

export function AgentStatusPanel() {
  const agents = [
    {
      name: "code-builder",
      type: "builder",
      status: "active",
      currentTask: "Implement JWT authentication",
      load: 2,
      maxTasks: 3
    },
    {
      name: "research-assistant",
      type: "researcher",
      status: "active",
      currentTask: "Analyze competitor pricing",
      load: 1,
      maxTasks: 3
    },
    {
      name: "qa-tester",
      type: "qa",
      status: "idle",
      currentTask: null,
      load: 0,
      maxTasks: 3
    },
    {
      name: "deploy-manager",
      type: "deployer",
      status: "idle",
      currentTask: null,
      load: 0,
      maxTasks: 2
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          Agent Status
        </h2>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
          {agents.filter(a => a.status === 'active').length} Active
        </span>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.name} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Circle className={`w-2 h-2 ${agent.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {agent.type}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {agent.load}/{agent.maxTasks} tasks
              </div>
            </div>
            {agent.currentTask && (
              <div className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                → {agent.currentTask}
              </div>
            )}
            {!agent.currentTask && (
              <div className="text-sm text-gray-400 dark:text-gray-500 ml-4">
                Idle - waiting for tasks
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
