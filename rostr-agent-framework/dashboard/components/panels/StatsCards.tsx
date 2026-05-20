"use client"

import { Bot, ListTodo, CheckCircle, Database } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalAgents: number
    activeTasks: number
    completedToday: number
    knowledgeEntries: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Registered Agents",
      value: stats.totalAgents,
      icon: Bot,
      color: "bg-blue-500",
      description: "Active agents in registry"
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      icon: ListTodo,
      color: "bg-purple-500",
      description: "Currently executing"
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle,
      color: "bg-green-500",
      description: "Tasks finished"
    },
    {
      title: "Knowledge Entries",
      value: stats.knowledgeEntries,
      icon: Database,
      color: "bg-orange-500",
      description: "RAG DAL indexed"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {card.description}
              </p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
