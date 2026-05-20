"use client"

import { Zap, ArrowRight, Send } from "lucide-react"
import { useState } from "react"

export default function PALPage() {
  const [input, setInput] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationResult, setCompilationResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCompiling(true)

    // Simulate compilation pipeline
    setTimeout(() => {
      setCompilationResult({
        input: input,
        stages: [
          {
            name: "Extract",
            status: "complete",
            time: "120ms",
            output: "Extracted intent: Build authentication system"
          },
          {
            name: "Context",
            status: "complete",
            time: "80ms",
            output: "Injected context: project=rostr-dashboard, org=acme, team=platform"
          },
          {
            name: "Enhance",
            status: "complete",
            time: "200ms",
            output: "Enhanced with RAG DAL knowledge: JWT best practices, security patterns"
          },
          {
            name: "Compile",
            status: "complete",
            time: "150ms",
            output: "Compiled to structured prompt with 4 phases"
          },
          {
            name: "Route",
            status: "complete",
            time: "50ms",
            output: "Routed to: code-builder (Development), research-assistant (PreD)"
          },
        ],
        compiledIntent: {
          phases: ["PreD", "Development", "Debugging", "Deployment"],
          agents: ["research-assistant", "code-builder"],
          priority: 7.8,
          tasks: [
            "Research JWT authentication best practices",
            "Implement JWT token generation and validation",
            "Test authentication flow",
            "Deploy authentication middleware"
          ]
        }
      })
      setIsCompiling(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PAL Compiler</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Prompt Abstraction Layer - Transform raw natural language into structured, context-enhanced prompts
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            5-Stage Compilation Pipeline
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Extract → Context → Enhance → Compile → Route
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Raw Natural Language Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your task or request in natural language..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isCompiling}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isCompiling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Compile Intent
              </>
            )}
          </button>
        </form>

        {compilationResult && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Original Input:</div>
              <div className="text-sm text-gray-900 dark:text-white font-mono">{compilationResult.input}</div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pipeline Stages:</h3>
              <div className="space-y-3">
                {compilationResult.stages.map((stage: any, index: number) => (
                  <div key={stage.name}>
                    <div className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{stage.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{stage.time}</span>
                            <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stage.output}</p>
                      </div>
                    </div>
                    {index < compilationResult.stages.length - 1 && (
                      <div className="ml-4 my-2">
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-4">Compiled Intent:</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Phases:</div>
                  <div className="flex flex-wrap gap-2">
                    {compilationResult.compiledIntent.phases.map((phase: string) => (
                      <span key={phase} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full font-medium">
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Assigned Agents:</div>
                  <div className="flex flex-wrap gap-2">
                    {compilationResult.compiledIntent.agents.map((agent: string) => (
                      <span key={agent} className="text-xs px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Priority Score:</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {compilationResult.compiledIntent.priority}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Generated Tasks:</div>
                  <ol className="space-y-2">
                    {compilationResult.compiledIntent.tasks.map((task: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        {task}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Example Inputs:</h3>
        <div className="space-y-2">
          {[
            "Build a user authentication system with JWT",
            "Research competitor pricing and create a pricing page",
            "Fix the bug where users can't log in after password reset",
            "Deploy the new payment integration to production"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="w-full text-left px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
