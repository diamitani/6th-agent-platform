"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Zap, Key, Shield } from "lucide-react"

const PLANS = [
  {
    id: "free", name: "Free", price: "$0", cadence: "forever",
    tagline: "Walk on. See the game.",
    highlight: false, cta: "Take command — free", href: "/auth/signup",
    features: ["3 agents on your roster", "100 credits included (~$1 of model time)", "1 GB knowledge base", "Command Center + Sixy copilot", "Enably GTM skills (compiled prompts)"],
  },
  {
    id: "core", name: "Core", price: "$29", cadence: "/month",
    tagline: "Your first real squad.",
    highlight: true, cta: "Start Core", href: "/auth/signup?plan=core",
    features: ["10 agents on your roster", "1,200 credits/month (~$12 of model time)", "10 GB knowledge base", "Composio tool arsenal (300+ apps)", "Bedrock Claude chat included", "BYOK supported"],
  },
  {
    id: "pro", name: "Pro", price: "$99", cadence: "/month",
    tagline: "General of the army.",
    highlight: false, cta: "Go Pro", href: "/auth/signup?plan=pro",
    features: ["Unlimited agents", "5,000 credits/month (~$50 of model time)", "50 GB knowledge base", "Swarm missions + analytics", "Priority support", "BYOK supported"],
  },
  {
    id: "agency", name: "Agency", price: "$299", cadence: "/month",
    tagline: "Command multiple fronts.",
    highlight: false, cta: "Talk to us", href: "/auth/signup?plan=agency",
    features: ["Multi-company workspaces", "18,000 credits/month (~$180 of model time)", "250 GB knowledge base", "White-label (coming)", "Dedicated infrastructure path", "BYOK supported"],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Nav */}
      <nav className="border-b border-[#E8E4DE] bg-parchment/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">6A</div>
            <span className="font-heading text-base font-semibold">Sixth Agent</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-charcoal-light hover:text-charcoal">Sign in</Link>
            <Link href="/auth/signup">
              <Button size="sm" className="rounded-full">Take command</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-16 pb-10 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <Badge variant="gold" className="mb-4 text-[10px] font-semibold uppercase tracking-widest">Pricing</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
            From walk-on to starter.<br />
            <span className="text-[#FF6B00]">Pick your minutes.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Every plan includes your own company instance on AWS — private knowledge base,
            agent roster, and metered model credits. Bring your own key any time.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`command-card relative flex flex-col p-6 ${
                plan.highlight ? "border-[#FF6B00]/40 shadow-lg shadow-[#FF6B00]/10" : ""
              }`}
            >
              {plan.highlight && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-[10px] uppercase tracking-widest">
                  Most popular
                </Badge>
              )}
              <p className="font-heading text-lg font-bold">{plan.name}</p>
              <p className="text-xs text-muted-foreground">{plan.tagline}</p>
              <p className="mt-4">
                <span className="font-heading text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground"> {plan.cadence}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                    <span className="text-charcoal/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="mt-6">
                <Button variant={plan.highlight ? "default" : "outline"} className="w-full gap-2">
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Credits & BYOK explainer */}
      <section className="pb-20">
        <div className="mx-auto grid max-w-4xl gap-5 px-6 md:grid-cols-3">
          <div className="command-card p-5">
            <Zap className="h-5 w-5 text-[#FF6B00]" />
            <p className="mt-3 text-sm font-semibold">Credits, simply</p>
            <p className="mt-1 text-xs text-muted-foreground">
              1 credit = $0.01 of model time on AWS Bedrock (Claude). Every agent run is
              metered to the token — see exactly what each mission cost.
            </p>
          </div>
          <div className="command-card p-5">
            <Key className="h-5 w-5 text-[#FF6B00]" />
            <p className="mt-3 text-sm font-semibold">Bring your own key</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Plug in your Anthropic, OpenAI, or Bedrock key on Core and above — your
              agents run on your account, credits untouched.
            </p>
          </div>
          <div className="command-card p-5">
            <Shield className="h-5 w-5 text-[#FF6B00]" />
            <p className="mt-3 text-sm font-semibold">Your instance, isolated</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Each company gets its own namespaced instance on AWS — encrypted S3
              knowledge base, private roster, full usage ledger.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8E4DE] py-8 text-center text-xs text-[#A8A8A8]">
        &copy; 2026 Sixth Agent. Ball&apos;s in your court.
      </footer>
    </div>
  )
}
