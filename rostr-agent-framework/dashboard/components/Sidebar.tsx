"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  ListTodo,
  Database,
  BarChart3,
  Settings,
  Zap,
  Brain,
  GitBranch
} from "lucide-react"

const navigation = [
  { name: "Mission Control", href: "/", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Tasks (NPAO)", href: "/tasks", icon: ListTodo },
  { name: "Knowledge Base", href: "/knowledge", icon: Database },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "PAL Compiler", href: "/pal", icon: Zap },
  { name: "RAG DAL", href: "/ragdal", icon: Brain },
  { name: "Workflows", href: "/workflows", icon: GitBranch },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-blue-400">Rostr</span> Hub
        </h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-150
                ${isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-400">
          <div className="font-semibold text-white mb-1">Framework v0.1.0</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>4 Layers Active</span>
            </div>
          </div>
          <div className="mt-2 text-xs">
            PAL • RAG DAL • NPAO • Hub
          </div>
        </div>
      </div>
    </div>
  )
}
