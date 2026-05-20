import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Bot, Zap, ArrowRight, Check, Star, MessageSquare, Layers, Cpu, Shield, Users } from "lucide-react"

const features = [
  { icon: Zap, title: "Natural Language → Agent", desc: "Describe what you need. PAL compiles it into a working agent with system prompt, triggers, and behavior.", color: "#FF6B00" },
  { icon: Layers, title: "ROSTR Architecture", desc: "Phase-aware orchestration. 5D taxonomy. 4D priority scoring. Knowledge that compounds across sessions.", color: "#2563EB" },
  { icon: Cpu, title: "Free AI Providers", desc: "Ollama (local, $0) or Gemini (free tier). No vendor lock-in. Toggle providers in the chat UI.", color: "#059669" },
]

const stats = [
  { value: "Zero", label: "Vendor Lock-In" },
  { value: "5‑Stage", label: "PAL Pipeline" },
  { value: "100+", label: "Integrations" },
  { value: "Free", label: "To Start" },
]

const testimonials = [
  { quote: "I typed what I needed and had a working agent in 30 seconds. PAL is wild.", name: "Marcus J.", role: "Founder", initials: "MJ" },
  { quote: "The only platform that compiles natural language into actual agent logic. Game changer.", name: "Sarah K.", role: "Agency Owner", initials: "SK" },
  { quote: "Switched from CrewAI. PAL compilation alone is worth it — no more prompt engineering.", name: "Devon T.", role: "Solo Founder", initials: "DT" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-parchment/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6B00] text-xs font-bold text-white shadow-lg shadow-[#FF6B00]/30">
              CA
            </div>
            <span className="font-heading text-lg font-semibold">6thAgent</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <a href="#how" className="btn-ghost text-sm">How it works</a>
            <a href="#features" className="btn-ghost text-sm">Features</a>
            <Link href="/marketplace" className="btn-ghost text-sm">Templates</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" className="text-sm">Sign in</Button></Link>
            <Link href="/auth/signup"><Button className="gap-2 text-sm shadow-lg shadow-[#FF6B00]/20"><Sparkles className="h-4 w-4" /> Build Your First Agent Free</Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] -top-48 -left-48 rounded-full bg-[#FF6B00]/5 blur-3xl" />
          <div className="absolute w-[400px] h-[400px] top-1/2 -right-32 rounded-full bg-[#FF6B00]/3 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 relative w-full">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-5 px-4 py-1.5 text-sm gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> PAL-powered agent compilation
            </Badge>

            <h1 className="font-heading text-5xl font-bold leading-[1.1] md:text-7xl lg:text-7xl">
              Describe what you need.{" "}
              <span className="text-[#FF6B00]">Get a working agent.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-charcoal-light/80 md:text-xl">
              6thAgent uses <strong className="text-charcoal">PAL</strong> — a 5-stage compiler that transforms natural language
              into a structured, production-ready agent manifest. No prompt engineering. No templates. Just describe it.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 px-8 text-base shadow-2xl shadow-[#FF6B00]/30 bg-[#FF6B00] hover:bg-[#E85D00]">
                  <Sparkles className="h-5 w-5" /> Build Your First Agent Free
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" size="lg" className="gap-2 px-8 text-base">
                  How PAL Works <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Works with Ollama ($0)</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Or Gemini (free tier)</span>
            </div>
          </div>

          {/* Product Mockup */}
          <div className="mt-16 mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-2 shadow-2xl">
              <div className="rounded-xl border border-border/20 overflow-hidden bg-white">
                <div className="flex h-9 items-center gap-1.5 border-b border-border/20 bg-parchment/50 px-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <div className="ml-4 rounded-md bg-[#FF6B00]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#FF6B00]">6thAgent — Agent Builder</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-muted-foreground">PAL Ready — describe your agent</span>
                  </div>
                  <div className="rounded-xl bg-charcoal/5 border border-border/30 p-4">
                    <p className="text-sm text-charcoal-light/60 mb-2">PAL Input:</p>
                    <p className="text-sm text-charcoal leading-relaxed">
                      "I need an agent that sends 30 personalized DMs per day on Instagram, LinkedIn, and Twitter.
                      It should follow a 3-touch sequence and require my approval before sending."
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <div className="flex items-center gap-2 rounded-lg bg-[#FF6B00] text-white px-4 py-2 text-xs font-semibold shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" /> Compile Agent
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    {[
                      { label: "Domain", value: "Sales / Outreach" },
                      { label: "Triggers", value: "DM, Outreach, Follow-up" },
                      { label: "Constraints", value: "Approval required" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-border/20 bg-parchment/50 p-2.5">
                        <p className="text-muted-foreground">{item.label}</p>
                        <p className="font-medium text-charcoal">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/30 bg-white/40">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-4xl font-bold text-[#FF6B00] md:text-5xl">{s.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW PAL WORKS */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">The PAL Pipeline</Badge>
            <h2 className="font-heading text-3xl font-bold md:text-4xl">Natural language in. Agent manifest out.</h2>
            <p className="mt-3 text-lg text-muted-foreground">5 stages. No templates. No prompt engineering.</p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-5">
            {[
              { step: "01", title: "Intent Extraction", desc: "Parse natural language into structured JSON: domain, subject, constraints, urgency, output format.", color: "#FF6B00" },
              { step: "02", title: "Context Injection", desc: "Auto-load org identity, ICP, existing agents, and knowledge docs from the Reference Hub.", color: "#E85D00" },
              { step: "03", title: "Semantic Enhancement", desc: "Expand vague verbs into precise instructions. Add missing success criteria and verification steps.", color: "#D94F00" },
              { step: "04", title: "Runtime Compilation", desc: "Produce a typed agent manifest with system prompt, triggers, behavior profile, and memory config.", color: "#C0272D" },
              { step: "05", title: "Output Routing", desc: "Route the compiled agent to your roster. Ready to chat immediately. No additional setup.", color: "#A31F24" },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-border/40 bg-card p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold" style={{ backgroundColor: s.color }}>
                  {s.step}
                </div>
                <h3 className="font-heading text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-y border-border/30 bg-white/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: f.color + "12" }}>
                  <f.icon className="h-6 w-6" style={{ color: f.color }} />
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold">Used by operators who ship</h2>
            <p className="mt-3 text-muted-foreground">From solo founders to agencies — PAL changes how you build agents.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="relative rounded-2xl border border-border/40 bg-card p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />)}
                </div>
                <p className="text-sm leading-relaxed text-charcoal-light italic">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-white">{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/30 bg-charcoal py-24">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 rounded-full bg-[#FF6B00]/5 blur-3xl" />
        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <h2 className="font-heading text-4xl font-bold text-white md:text-5xl">Your first agent is one description away</h2>
          <p className="mt-4 text-lg text-white/60">Free. No credit card. PAL compiles your first agent in seconds.</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 bg-[#FF6B00] hover:bg-[#E85D00] text-white shadow-2xl shadow-[#FF6B00]/20 px-8 text-base">
                <Sparkles className="h-5 w-5" /> Build Your First Agent Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/30 bg-white/40 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B00] text-xs font-bold text-white">CA</div>
              <span className="font-heading text-base font-semibold">6thAgent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-semibold">PAL</span> + <span className="font-semibold">ROSTR</span> — Natural language → Working agent.
            </p>
            <p className="text-sm text-muted-foreground">&copy; 2026 6thAgent. Free to use. Open system.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
