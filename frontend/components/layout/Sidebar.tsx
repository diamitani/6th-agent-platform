"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/hooks/use-app-store"
import {
  LayoutDashboard, Bot, PlusCircle, BookOpen, HardDrive, MessageSquare,
  Settings, Users, Library, Puzzle, ShoppingBag, ChevronLeft, Sparkles,
  ChevronDown, Code, Cloud, Terminal, Compass, GitBranch, Network, Globe, Key, Rocket,
  Crosshair, Wand2,
} from "lucide-react"
import { useState } from "react"

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard/command", label: "Command Center", icon: Crosshair },
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
      { href: "/dashboard/skills", label: "Skills", icon: Wand2 },
      { href: "/dashboard/canvas", label: "Visual Canvas", icon: GitBranch },
      { href: "/dashboard/ide", label: "Mini IDE", icon: Code },
      { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
      { href: "/dashboard/knowledge", label: "Knowledge Base", icon: BookOpen },
    ],
  },
  {
    label: "Deploy",
    items: [
      { href: "/dashboard/setup", label: "One-Click Setup", icon: Rocket },
      { href: "/dashboard/swarm", label: "Swarm Command", icon: Network },
      { href: "/dashboard/cloud", label: "Cloud Manager", icon: Globe },
    ],
  },
  {
    label: "Configure",
    items: [
      { href: "/dashboard/byok", label: "BYOK Provider", icon: Key },
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
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-border/60 px-4",
        sidebarOpen ? "justify-between" : "justify-center"
      )}>
        {sidebarOpen && (
          <Link href="/dashboard/command" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-xs font-semibold text-white">
              6A
            </div>
            <div>
              <span className="font-heading text-base font-semibold">Sixth Agent</span>
              <p className="-mt-0.5 font-mono text-[10px] text-muted-foreground">command your roster</p>
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-muted-foreground/60 transition-all hover:bg-charcoal/5 hover:text-charcoal"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {sidebarOpen && (
              <p className="px-2 pb-1 font-mono text-[10px] font-medium lowercase tracking-widest text-muted-foreground/60">{group.label}</p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-charcoal-light hover:bg-charcoal/5 hover:text-charcoal",
                    !sidebarOpen && "justify-center px-2 py-2"
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                  {sidebarOpen && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade Banner */}
      <div className={cn(
        "border-t border-border/60 p-3",
        !sidebarOpen && "flex justify-center"
      )}>
        {sidebarOpen ? (
          <Link href="/pricing" className="group flex items-center gap-3 rounded-lg border border-border/70 bg-white p-3 transition-colors hover:border-primary/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-charcoal">Free plan</p>
              <p className="text-[10px] text-muted-foreground transition-colors group-hover:text-charcoal-light">Upgrade for more minutes</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground/50 transition-colors group-hover:text-primary" />
          </Link>
        ) : (
          <Link href="/pricing">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}
