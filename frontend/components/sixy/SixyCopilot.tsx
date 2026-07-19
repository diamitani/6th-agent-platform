"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { X, Sparkles, ChevronRight, Puzzle, BookOpen, Bot, Crosshair, Zap } from "lucide-react"
import { ENABLY_SKILLS } from "@/lib/skills/enably"

const INTRO_SEEN_KEY = "sixy-intro-seen"

const CAPABILITIES = [
  { icon: Bot, label: "Building your agent team", desc: "Describe an outcome — PAL compiles the agent", href: "/dashboard/builder" },
  { icon: Puzzle, label: "Arming agents with tools", desc: "Gmail, HubSpot, Slack + 300 more via Composio", href: "/dashboard/integrations" },
  { icon: Zap, label: "GTM skills (Enably pack)", desc: "ICPs, personas, playbooks, campaigns, call scripts", href: "/dashboard/skills" },
  { icon: BookOpen, label: "Growing your knowledge base", desc: "Every doc compounds across your whole roster", href: "/dashboard/knowledge" },
  { icon: Crosshair, label: "Running the Command Center", desc: "Missions triage themselves — N → A → P → O", href: "/dashboard/command" },
]

const SETUP_STEPS = [
  { label: "Connect your first integration", href: "/dashboard/integrations" },
  { label: "Upload brand + ICP docs", href: "/dashboard/knowledge" },
  { label: "Deploy your first agent", href: "/dashboard/builder" },
  { label: "Run a GTM skill", href: "/dashboard/skills" },
]

export function SixyCopilot() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"help" | "setup">("help")

  // Auto-open once: right after onboarding (?welcome=1) or on the user's
  // first dashboard visit.
  useEffect(() => {
    try {
      const seen = localStorage.getItem(INTRO_SEEN_KEY)
      const fromOnboarding = searchParams.get("welcome") === "1"
      if (fromOnboarding || !seen) {
        setOpen(true)
        setTab(fromOnboarding ? "setup" : "help")
        localStorage.setItem(INTRO_SEEN_KEY, "1")
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Sixy, your agent copilot"
        className="fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary p-3.5 text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <span className="font-heading text-lg font-bold text-white">6</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="animate-scale-in fixed bottom-24 right-6 z-50 flex max-h-[75vh] w-[22.5rem] flex-col overflow-hidden rounded-2xl border border-border/50 bg-white shadow-2xl shadow-charcoal/15">
          {/* Header */}
          <div className="border-b border-border/60 bg-parchment-dark p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-lg font-bold text-white">
                6
              </div>
              <div>
                <p className="font-heading text-base font-bold leading-snug">
                  Hi, I&apos;m Sixy! <span className="font-normal text-muted-foreground">(and so are you ;)</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Your agent copilot. I can help you with:</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1 rounded-xl border border-border/60 bg-white p-1">
              {(["help", "setup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    tab === t ? "bg-charcoal text-white" : "text-muted-foreground hover:text-charcoal"
                  }`}
                >
                  {t === "help" ? "What I do" : "Setup guide"}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {tab === "help" &&
              CAPABILITIES.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-[#C96442]/30 hover:shadow-sm ${
                    pathname === c.href ? "border-[#C96442]/30 bg-[#C96442]/5" : "border-border/40"
                  }`}
                >
                  <div className="rounded-lg bg-[#C96442]/8 p-2">
                    <c.icon className="h-4 w-4 text-[#C96442]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}

            {tab === "setup" && (
              <>
                <p className="px-1 text-xs text-muted-foreground">
                  Four moves and your operation is live. In NPAO order, naturally.
                </p>
                {SETUP_STEPS.map((s, i) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-xl border border-border/40 p-3 transition-all hover:border-[#C96442]/30 hover:shadow-sm"
                  >
                    <span className="mono-data flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold">{s.label}</p>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
                <div className="rounded-xl bg-parchment-dark p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-gold" /> Popular first skill
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    &ldquo;{ENABLY_SKILLS[0].name}&rdquo; — {ENABLY_SKILLS[0].description}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-border/40 px-4 py-2.5">
            <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
              Sixy · your sixth man, on every page
            </p>
          </div>
        </div>
      )}
    </>
  )
}
