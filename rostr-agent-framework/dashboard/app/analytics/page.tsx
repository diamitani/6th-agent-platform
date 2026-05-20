"use client"

import { BarChart3, TrendingUp, Clock, DollarSign } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AnalyticsPage() {
  const agentUtilizationData = [
    { time: "00:00", "code-builder": 45, "research-assistant": 30, "qa-tester": 20, "deploy-manager": 10 },
    { time: "04:00", "code-builder": 50, "research-assistant": 35, "qa-tester": 25, "deploy-manager": 15 },
    { time: "08:00", "code-builder": 75, "research-assistant": 60, "qa-tester": 40, "deploy-manager": 20 },
    { time: "12:00", "code-builder": 85, "research-assistant": 70, "qa-tester": 55, "deploy-manager": 30 },
    { time: "16:00", "code-builder": 90, "research-assistant": 65, "qa-tester": 50, "deploy-manager": 25 },
    { time: "20:00", "code-builder": 60, "research-assistant": 40, "qa-tester": 30, "deploy-manager": 15 },
  ]

  const taskCompletionData = [
    { date: "Mon", completed: 12, failed: 1 },
    { date: "Tue", completed: 15, failed: 2 },
    { date: "Wed", completed: 18, failed: 1 },
    { date: "Thu", completed: 14, failed: 0 },
    { date: "Fri", completed: 20, failed: 2 },
    { date: "Sat", completed: 8, failed: 1 },
    { date: "Sun", completed: 6, failed: 0 },
  ]

  const knowledgeGrowthData = [
    { week: "Week 1", entries: 45 },
    { week: "Week 2", entries: 78 },
    { week: "Week 3", entries: 112 },
    { week: "Week 4", entries: 156 },
  ]

  const phaseDistribution = [
    { name: "PreD", value: 15, color: "#9333ea" },
    { name: "Design", value: 20, color: "#22c55e" },
    { name: "Development", value: 35, color: "#3b82f6" },
    { name: "Deployment", value: 18, color: "#f97316" },
    { name: "Debugging", value: 12, color: "#ef4444" },
  ]

  const costData = [
    { agent: "code-builder", cost: 45.20, tasks: 24 },
    { agent: "research-assistant", cost: 32.50, tasks: 18 },
    { agent: "qa-tester", cost: 28.10, tasks: 31 },
    { agent: "deploy-manager", cost: 18.75, tasks: 9 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Performance metrics, trends, and insights across all agents and tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            Avg Agent Utilization
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">67%</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12% from last week</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            Task Completion Rate
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">94.2%</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 3% from last week</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            Avg Completion Time
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">10.2m</div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">↓ 5% from last week</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            Total Cost (7d)
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">$124.55</div>
          <div className="text-xs text-gray-500 mt-1">$1.52 per task</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Utilization (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={agentUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="code-builder" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="research-assistant" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="qa-tester" stroke="#f97316" strokeWidth={2} />
              <Line type="monotone" dataKey="deploy-manager" stroke="#9333ea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">code-builder</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">research-assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">qa-tester</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">deploy-manager</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Completion Trend (7d)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="completed" fill="#22c55e" />
              <Bar dataKey="failed" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600 dark:text-gray-400">Failed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Knowledge Base Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={knowledgeGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="entries" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phase Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={phaseDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {phaseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown by Agent</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Agent</th>
                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Tasks Completed</th>
                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Total Cost</th>
                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Cost per Task</th>
              </tr>
            </thead>
            <tbody>
              {costData.map((item) => (
                <tr key={item.agent} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 text-sm text-gray-900 dark:text-white font-medium">{item.agent}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400 text-right">{item.tasks}</td>
                  <td className="py-3 text-sm text-gray-900 dark:text-white text-right">${item.cost.toFixed(2)}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400 text-right">${(item.cost / item.tasks).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td className="py-3 text-sm font-bold text-gray-900 dark:text-white">Total</td>
                <td className="py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                  {costData.reduce((sum, item) => sum + item.tasks, 0)}
                </td>
                <td className="py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                  ${costData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                </td>
                <td className="py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                  ${(costData.reduce((sum, item) => sum + item.cost, 0) / costData.reduce((sum, item) => sum + item.tasks, 0)).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
