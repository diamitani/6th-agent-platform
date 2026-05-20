import { useAppStore } from "@/hooks/use-app-store"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts)
  const removeToast = useAppStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-right",
            toast.type === "success" && "bg-green-600 text-white",
            toast.type === "error" && "bg-red-600 text-white",
            toast.type === "info" && "bg-charcoal text-white"
          )}
        >
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
