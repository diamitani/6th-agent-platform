"use client"

import { Sidebar } from "./Sidebar"
import { useAppStore } from "@/hooks/use-app-store"
import { cn } from "@/lib/utils"
import { Toaster } from "react-hot-toast"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="min-h-screen bg-parchment">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-6 md:p-8">{children}</div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#fff",
            fontFamily: "Lato, system-ui, sans-serif",
          },
        }}
      />
    </div>
  )
}
