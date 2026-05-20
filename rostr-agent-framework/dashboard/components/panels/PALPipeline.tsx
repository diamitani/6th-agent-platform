"use client"

import { ArrowRight, Zap } from "lucide-react"

export function PALPipeline() {
  const stages = [
    { name: "Extract", status: "complete", time: "120ms" },
    { name: "Context", status: "complete", time: "80ms" },
    { name: "Enhance", status: "active", time: "200ms" },
    { name: "Compile", status: "pending", time: "-" },
    { name: "Route", status: "pending", time: "-" },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          PAL Compilation Pipeline
        </h2>
        <span className="text-xs text-gray-500">Last run: 2s ago</span>
      </div>

      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm">
        <div className="text-gray-500 mb-1">Input:</div>
        <div className="text-gray-900 dark:text-white font-mono">
          "Research competitor pricing and build a pricing page"
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.name}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  ${stage.status === 'complete' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    stage.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 animate-pulse' :
                    'bg-gray-100 text-gray-400 dark:bg-gray-700'}
                `}>
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {stage.name}
                  </div>
                  <div className="text-xs text-gray-500">{stage.time}</div>
                </div>
              </div>
              {stage.status === 'complete' && (
                <div className="text-xs text-green-600 dark:text-green-400">✓</div>
              )}
              {stage.status === 'active' && (
                <div className="text-xs text-blue-600 dark:text-blue-400">●</div>
              )}
            </div>
            {index < stages.length - 1 && (
              <div className="ml-4 mt-2 mb-2">
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
        <div className="text-blue-700 dark:text-blue-300 font-medium mb-1">
          Compiled Intent:
        </div>
        <div className="text-blue-900 dark:text-blue-100 text-xs">
          Phase: PreD → Design → Development → Deployment
        </div>
      </div>
    </div>
  )
}
