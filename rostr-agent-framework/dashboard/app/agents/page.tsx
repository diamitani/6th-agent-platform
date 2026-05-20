"use client"

import { Bot, Zap, Circle, Cpu } from "lucide-react"

export default function AgentsPage() {
  const agents = [
    {
      id: "1",
      name: "code-builder",
      type: "builder",
      status: "active",
      model: "claude-sonnet-4-6",
      capabilities: ["code_generation", "file_editing", "refactoring", "debugging"],
      tools: ["file_system", "code_execution", "bash", "git"],
      phases: ["development", "debugging"],
      currentTask: "Implement JWT authentication",
      tasksCompleted: 24,
      avgCompletionTime: "12m",
      load: 2,
      maxTasks: 3
    },
    {
      id: "2",
      name: "research-assistant",
      type: "researcher",
      status: "active",
      model: "claude-sonnet-4-6",
      capabilities: ["web_research", "data_analysis", "documentation", "knowledge_synthesis"],
      tools: ["web_search", "web_fetch", "file_system"],
      phases: ["pred", "design"],
      currentTask: "Research Stripe subscription API",
      tasksCompleted: 18,
      avgCompletionTime: "8m",
      load: 1,
      maxTasks: 3
    },
    {
      id: "3",
      name: "qa-tester",
      type: "qa",
      status: "idle",
      model: "claude-sonnet-4-6",
      capabilities: ["test_generation", "test_execution", "bug_detection", "quality_assurance"],
      tools: ["test_runner", "code_execution", "file_system"],
      phases: ["debugging", "deployment"],
      currentTask: null,
      tasksCompleted: 31,
      avgCompletionTime: "6m",
      load: 0,
      maxTasks: 3
    },
    {
      id: "4",
      name: "deploy-manager",
      type: "deployer",
      status: "idle",
      model: "claude-sonnet-4-6",
      capabilities: ["deployment", "infrastructure", "monitoring", "rollback"],
      tools: ["bash", "docker", "kubernetes", "cloud_apis"],
      phases: ["deployment"],
      currentTask: null,
      tasksCompleted: 9,
      avgCompletionTime: "15m",
      load: 0,
      maxTasks: 2
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Registry</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          All registered agents with their capabilities, tools, and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Agents</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{agents.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {agents.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks Completed</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {agents.reduce((sum, a) => sum + a.tasksCompleted, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Completion Time</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">10m</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Circle className={`w-2 h-2 ${agent.status === 'active' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                    <span className="text-xs text-gray-500 capitalize">{agent.status}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {agent.type}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Model</div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{agent.model}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phases</div>
                <div className="flex flex-wrap gap-1">
                  {agent.phases.map((phase) => (
                    <span key={phase} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded">
                      {phase.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Capabilities</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <span key={cap} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded">
                      {cap.replace('_', ' ')}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tools</div>
                <div className="flex flex-wrap gap-1">
                  {agent.tools.map((tool) => (
                    <span key={tool} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {agent.currentTask && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Task</div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span className="text-sm text-gray-900 dark:text-white">{agent.currentTask}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Load</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.load}/{agent.maxTasks}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.tasksCompleted}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg Time</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {agent.avgCompletionTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
