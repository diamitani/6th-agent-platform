import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "6thAgent — Build Your Agent Team",
  description: "Build, deploy, and manage AI agent teams. ROSTR-powered orchestration with persistent memory, shared knowledge, and FPE iteration protocol.",
  keywords: ["AI agents", "agent builder", "ROSTR", "FPE", "multi-agent", "AI team", "agent orchestration"],
  openGraph: {
    title: "6thAgent — Build Your Agent Team",
    description: "Multi-tenant AI agent platform with ROSTR architecture.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='none' stroke='%23FF6B00' stroke-width='8' stroke-linecap='round'/><path d='M85 52A42 42 0 0 1 50 96' fill='none' stroke='%23FF6B00' stroke-width='8' stroke-linecap='round'/><polygon points='50,26 35,74 50,63 65,74' fill='%231A1A1A'/><line x1='40' y1='68' x2='60' y2='68' stroke='%231A1A1A' stroke-width='3' stroke-linecap='round'/></svg>" />
      </head>
      <body className="min-h-screen bg-parchment font-body antialiased">
        {children}
        <Toaster position="bottom-right" toastOptions={{ style: { background: "#1A1A1A", color: "#fff", fontFamily: "Lato, system-ui, sans-serif" } }} />
      </body>
    </html>
  )
}
