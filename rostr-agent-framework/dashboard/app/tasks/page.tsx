"use client"

import { ListTodo, AlertCircle, Clock, CheckCircle, ArrowRight } from "lucide-react"

export default function TasksPage() {
  const tasks = [
    {
      id: "1",
      description: "Fix login redirect bug",
      phase: "debugging",
      priority: 9.1,
      agent: "code-builder",
      status: "queued",
      phaseUrgency: 9.0,
      dependency: 8.5,
      business: 9.5,
      resource: 7.0,
      dependencies: [],
      createdAt: "2 hours ago"
    },
    {
      id: "2",
      description: "Research Stripe subscription API",
      phase: "pred",
      priority: 8.5,
      agent: "research-assistant",
      status: "in_progress",
      phaseUrgency: 7.5,
      dependency: 9.0,
      business: 8.5,
      resource: 9.0,
      dependencies: [],
      createdAt: "3 hours ago"
    },
    {
      id: "3",
      description: "Implement JWT authentication",
      phase: "development",
      priority: 7.2,
      agent: "code-builder",
      status: "in_progress",
      phaseUrgency: 7.0,
      dependency: 8.0,
      business: 7.0,
      resource: 6.5,
      dependencies: ["2"],
      createdAt: "4 hours ago"
    },
    {
      id: "4",
      description: "Design pricing page wireframe",
      phase: "design",
      priority: 6.8,
      agent: "unallocated",
      status: "queued",
      phaseUrgency: 6.5,
      dependency: 5.0,
      business: 8.0,
      resource: 8.0,
      dependencies: ["2"],
      createdAt: "1 hour ago"
    },
    {
      id: "5",
      description: "Build pricing page component",
      phase: "development",
      priority: 6.2,
      agent: "unallocated",
      status: "queued",
      phaseUrgency: 6.0,
      dependency: 7.0,
      business: 6.5,
      resource: 5.5,
      dependencies: ["4"],
      createdAt: "1 hour ago"
    },
    {
      id: "6",
      description: "Deploy to staging environment",
      phase: "deployment",
      priority: 5.5,
      agent: "unallocated",
      status: "queued",
      phaseUrgency: 5.0,
      dependency: 6.5,
      business: 6.0,
      resource: 4.5,
      dependencies: ["3", "5"],
      createdAt: "30 minutes ago"
    },
  ]

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "pred": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "design": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "development": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "deployment": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
      case "debugging": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case "queued": return <AlertCircle className="w-4 h-4 text-orange-500" />
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NPAO Task Board</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Navigate, Prioritize, Allocate, Orchestrate - Priority-sorted task queue with 5D phase classification
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-xs font-medium text-purple-700 dark:text-purple-300">PreD</div>
          <div className="text-xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            {tasks.filter(t => t.phase === 'pred').length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-xs font-medium text-green-700 dark:text-green-300">Design</div>
          <div className="text-xl font-bold text-green-900 dark:text-green-100 mt-1">
            {tasks.filter(t => t.phase === 'design').length}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Development</div>
          <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {tasks.filter(t => t.phase === 'development').length}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Deployment</div>
          <div className="text-xl font-bold text-orange-900 dark:text-orange-100 mt-1">
            {tasks.filter(t => t.phase === 'deployment').length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-xs font-medium text-red-700 dark:text-red-300">Debugging</div>
          <div className="text-xl font-bold text-red-900 dark:text-red-100 mt-1">
            {tasks.filter(t => t.phase === 'debugging').length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-purple-500" />
            Priority Queue
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Formula: Phase×0.35 + Dependency×0.30 + Business×0.25 + Resource×0.10
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status)}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPhaseColor(task.phase)}`}>
                      {task.phase.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded font-medium">
                      Priority: {task.priority.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    {task.description}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created {task.createdAt}</span>
                    {task.agent !== 'unallocated' ? (
                      <span className="text-blue-600 dark:text-blue-400">→ {task.agent}</span>
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Unallocated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Phase Urgency</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{task.phaseUrgency.toFixed(1)} <span className="text-xs text-gray-400">×0.35</span></div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Dependency</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{task.dependency.toFixed(1)} <span className="text-xs text-gray-400">×0.30</span></div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Business Value</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{task.business.toFixed(1)} <span className="text-xs text-gray-400">×0.25</span></div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Resource Avail</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{task.resource.toFixed(1)} <span className="text-xs text-gray-400">×0.10</span></div>
                </div>
              </div>

              {task.dependencies.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Dependencies:</span>
                  <div className="flex items-center gap-1">
                    {task.dependencies.map((depId, idx) => {
                      const dep = tasks.find(t => t.id === depId)
                      return (
                        <div key={depId} className="flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {dep?.description.slice(0, 20)}...
                          </span>
                          {idx < task.dependencies.length - 1 && <ArrowRight className="w-3 h-3 text-gray-400" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
