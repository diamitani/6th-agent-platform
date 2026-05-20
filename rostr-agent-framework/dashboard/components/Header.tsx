"use client"

import { Bell, Search, User } from "lucide-react"

export function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents, tasks, knowledge..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">Workspace</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">default</div>
          </div>
          <button className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </button>
        </div>
      </div>
    </header>
  )
}
