import { create } from "zustand"

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  currentOrgId: string | null
  setCurrentOrgId: (id: string) => void

  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void

  toasts: { id: string; message: string; type: "success" | "error" | "info" }[]
  addToast: (message: string, type?: "success" | "error" | "info") => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  currentOrgId: null,
  setCurrentOrgId: (id) => set({ currentOrgId: id }),

  activeAgentId: null,
  setActiveAgentId: (id) => set({ activeAgentId: id }),

  toasts: [],
  addToast: (message, type = "info") => {
    const id = `toast-${++toastCounter}`
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
