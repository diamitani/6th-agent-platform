"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/hooks/use-app-store"
import {
  LayoutDashboard, Bot, PlusCircle, BookOpen, HardDrive, MessageSquare,
  Settings, Users, Library, Puzzle, ShoppingBag, ChevronLeft, Sparkles,
  ChevronDown, Code, Cloud, Terminal, Compass, GitBranch,
} from "lucide-react"
import { useState } from "react"

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "NPAO Canvas", icon: LayoutDashboard },
      { href: "/dashboard/guide", label: "Workflow Guide", icon: Compass },
      { href: "/dashboard/agents", label: "Agent Roster", icon: Bot },
      { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/dashboard/builder", label: "Agent Builder", icon: PlusCircle },
      { href: "/dashboard/canvas", label: "Visual Canvas", icon: GitBranch },
      { href: "/dashboard/ide", label: "Mini IDE", icon: Code },
      { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
      { href: "/dashboard/knowledge", label: "Knowledge Base", icon: BookOpen },
    ],
  },
  {
    label: "Connect",
    items: [
      { href: "/dashboard/mcp", label: "MCP Hub", icon: Puzzle },
      { href: "/dashboard/deploy", label: "Cloud Deploy", icon: Cloud },
      { href: "/dashboard/integrations", label: "Integrations", icon: Puzzle },
    ],
  },
  {
    label: "Organize",
    items: [
      { href: "/dashboard/teams", label: "Teams", icon: Users },
      { href: "/dashboard/hub", label: "Reference Hub", icon: Library },
      { href: "/dashboard/logs", label: "System Logs", icon: Terminal },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/storage", label: "Storage", icon: HardDrive },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-charcoal text-white transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/5 px-4",
        sidebarOpen ? "justify-between" : "justify-center"
      )}>
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white shadow-lg shadow-primary/30">
              RA
            </div>
            <div>
              <span className="font-heading text-base font-semibold">Rostr</span>
              <p className="-mt-0.5 text-[10px] text-white/40 font-body">Agent Builder</p>
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-white/30 transition-all hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {sidebarOpen && (
              <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">{group.label}</p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-gradient text-white shadow-lg shadow-primary/20"
                      : "text-white/40 hover:bg-white/5 hover:text-white",
                    !sidebarOpen && "justify-center px-2 py-2.5"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "drop-shadow-sm")} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade Banner */}
      <div className={cn(
        "border-t border-white/5 p-3",
        !sidebarOpen && "flex justify-center"
      )}>
        {sidebarOpen ? (
          <Link href="/pricing" className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 p-3 transition-all hover:from-gold/15 hover:to-gold/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gold">Free Plan</p>
              <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">Upgrade for more</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-white/20 group-hover:text-white/40" />
          </Link>
        ) : (
          <Link href="/pricing">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}
