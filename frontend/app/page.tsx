import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles, Building2, Shield, Zap, Users, BookOpen, ArrowRight, Check, Star, MessageSquare, Layers } from "lucide-react"

const features = [
  { icon: Bot, title: "Persistent Agents", desc: "Each agent keeps memory across sessions. Context never resets.", color: "#C0272D" },
  { icon: BookOpen, title: "Shared Knowledge Hub", desc: "One source of truth — every agent knows your ICP, playbooks, and brand.", color: "#F5C100" },
  { icon: Layers, title: "Team Orchestration", desc: "NPAO prioritization. Trigger words route tasks. Agents collaborate.", color: "#2563EB" },
  { icon: Building2, title: "Isolated Workspaces", desc: "Every org gets a private namespace. Data never leaks between tenants.", color: "#059669" },
  { icon: Shield, title: "Multi-Provider AI", desc: "Bring your own Gemini key, or use platform defaults. Zero vendor lock-in.", color: "#7C3AED" },
  { icon: Zap, title: "Ralph Wiggums Loop", desc: "Built-in iteration protocol. Ship → Test → Fix → Repeat. Never stall.", color: "#D97706" },
]

const stats = [
  { value: "20+", label: "Agent Templates" },
  { value: "100+", label: "Integrations" },
  { value: "3‑Layer", label: "Architecture" },
  { value: "Zero", label: "Vendor Lock-In" },
]

const testimonials = [
  { quote: "I set up my entire agent team in 10 minutes. The onboarding wizard is genius.", name: "Marcus J.", role: "Independent Artist", initials: "MJ" },
  { quote: "Finally, an AI platform that treats agents like a real team, not isolated chatbots.", name: "Sarah K.", role: "Agency Owner", initials: "SK" },
  { quote: "The NPAO canvas alone saves me 5 hours a week on prioritization.", name: "Devon T.", role: "Solo Founder", initials: "DT" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-parchment/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-xs font-bold text-white shadow-lg shadow-primary/20">
              6A
            </div>
            <span className="font-heading text-lg font-semibold">6thAgent</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/marketplace" className="btn-ghost text-sm">Marketplace</Link>
            <Link href="/pricing" className="btn-ghost text-sm">Pricing</Link>
            <a href="#features" className="btn-ghost text-sm">Features</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" className="text-sm">Sign in</Button></Link>
            <Link href="/auth/signup"><Button className="gap-2 text-sm shadow-lg shadow-primary/20"><Sparkles className="h-4 w-4" />Build Your Team Free</Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section relative min-h-[90vh] flex items-center pt-24">
        <div className="orb orb-primary w-[600px] h-[600px] -top-48 -left-48" />
        <div className="orb orb-gold w-[400px] h-[400px] top-1/2 -right-32" />
        <div className="mx-auto max-w-7xl px-6 py-20 relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              ROSTR-powered · FPE-driven · Multi-tenant
            </div>

            <h1 className="font-heading text-5xl font-bold leading-[1.1] md:text-7xl lg:text-8xl">
              Build your AI agent team.{" "}
              <span className="text-brand-gradient">Ship like a founder.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-charcoal-light/80 md:text-xl">
              The ROSTR-powered platform for building, deploying, and managing AI agent teams.
              Persistent memory, visual canvas, mini IDE, MCP integrations, cloud deployment —
              all in one open-system platform.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 px-8 text-base shadow-2xl shadow-primary/30">
                  <Sparkles className="h-5 w-5" /> Start Free
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="gap-2 px-8 text-base">
                  Browse Templates <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Visual canvas + IDE</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Open logs · No black box</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-2 shadow-2xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-parchment via-transparent to-transparent pointer-events-none z-10" />
              <div className="rounded-xl border border-border/30 overflow-hidden bg-white">
                <div className="flex h-8 items-center gap-1.5 border-b border-border/30 bg-parchment/50 px-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <div className="ml-4 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">dashboard — NPAO Canvas</div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
                  {[Bot, MessageSquare, BookOpen, Layers].map((Icon, i) => (
                    <div key={i} className="rounded-lg border border-border/30 bg-parchment/30 p-3">
                      <Icon className="mb-2 h-5 w-5 text-primary/60" />
                      <div className="h-3 w-20 rounded bg-muted-foreground/10" />
                      <div className="mt-1.5 h-6 w-12 rounded bg-muted-foreground/10" />
                    </div>
                  ))}
                  <div className="col-span-4 rounded-lg border border-border/30 bg-parchment/30 p-3">
                    <div className="mb-2 flex gap-2">
                      {["🎯", "📊", "✍️", "💬"].map((e, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-border/20 bg-white px-3 py-2 text-sm">
                          <span>{e}</span>
                          <span className="h-2 w-16 rounded bg-muted-foreground/10" />
                        </div>
                      ))}
                    </div>
                    <div className="h-3 w-48 rounded bg-muted-foreground/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/40 bg-white/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="stat-value text-brand-gradient">{stat.value}</p>
                <p className="stat-label mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - Bento Grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Platform Features</Badge>
            <h2 className="section-heading">Everything you need to run on autopilot</h2>
            <p className="section-sub mx-auto">
              Persistent agents, shared knowledge, team orchestration — all in one platform.
            </p>
          </div>

          <div className="mt-16 bento-grid">
            <div className="bento-span-12 md:bento-span-6 bento-card flex flex-col justify-between min-h-[280px] relative overflow-hidden">
              <div className="orb orb-primary w-64 h-64 -top-20 -right-20 opacity-30" />
              <div className="relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/20">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-2xl font-bold">Persistent Agent Memory</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed max-w-md">
                  Every agent remembers context across sessions. No more briefing AI from scratch.
                  Thread-based conversations persist until you reset them.
                </p>
              </div>
              <div className="relative z-10 mt-6 flex gap-3">
                {["🎯", "📊", "✍️"].map((e) => (
                  <div key={e} className="flex items-center gap-2 rounded-xl border border-border/40 bg-white/60 px-4 py-2.5 text-sm font-medium shadow-sm">
                    <span>{e}</span>
                    <span>Agent</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-span-12 md:bento-span-3 bento-card min-h-[280px]">
              <BookOpen className="mb-4 h-8 w-8 text-gold" />
              <h3 className="font-heading text-xl font-bold">Reference Hub</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                One shared knowledge base. All agents read from the same ICP, playbooks, and brand docs.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["ICP", "Playbooks", "Brand", "Research"].map((t) => (
                  <span key={t} className="tag-gold text-[11px]">{t}</span>
                ))}
              </div>
            </div>

            <div className="bento-span-12 md:bento-span-3 bento-card min-h-[280px]">
              <Layers className="mb-4 h-8 w-8 text-blue-500" />
              <h3 className="font-heading text-xl font-bold">Team Orchestration</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                NPAO prioritization. Trigger words route tasks to the right agent automatically.
              </p>
              <div className="mt-4 flex gap-2 text-sm">
                <code className="rounded-lg bg-charcoal/5 px-2.5 py-1.5 font-mono text-xs text-charcoal-light">/triage</code>
                <code className="rounded-lg bg-charcoal/5 px-2.5 py-1.5 font-mono text-xs text-charcoal-light">/ship</code>
              </div>
            </div>

            {features.slice(3).map((feature) => (
              <div key={feature.title} className="bento-span-12 md:bento-span-4 feature-card min-h-[200px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: feature.color + "15" }}>
                  <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <h3 className="mt-3 font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border/40 bg-white/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading">Trusted by operators</h2>
            <p className="section-sub mx-auto">Solo founders, creators, and agencies running on Rostr.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                </div>
                <p className="text-sm leading-relaxed text-charcoal-light">{t.quote}</p>
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {t.initials}
                  </div>
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

      {/* PRICING TEASER */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="gold" className="mb-4">Pricing</Badge>
            <h2 className="section-heading">Start free. Scale as you grow.</h2>
            <p className="section-sub mx-auto">From solo operator to agency. Pick the tier that fits.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", desc: "For solo operators testing the waters", features: ["3 agents", "1 team", "10 KB docs", "50 msgs/mo", "Gemini Flash"], cta: "Start Free", highlighted: false },
              { name: "Core", price: "$29", desc: "For growing teams who need more power", features: ["10 agents", "3 teams", "100 KB docs", "Unlimited msgs", "Gemini Pro"], cta: "Start Free Trial", highlighted: true },
              { name: "Pro", price: "$99", desc: "For agencies and power users", features: ["Unlimited agents", "Unlimited teams", "Unlimited KB", "Analytics", "Priority support"], cta: "Start Free Trial", highlighted: false },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? "border-gold/40 bg-white shadow-xl shadow-gold/5 scale-105"
                    : "border-border/50 bg-card hover:shadow-lg hover:border-primary/20"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="gold" className="px-4 py-1 text-xs font-semibold shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <Button
                    variant={tier.highlighted ? "default" : "outline"}
                    className={`mt-8 w-full ${tier.highlighted ? "shadow-lg shadow-primary/20" : ""}`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/40 bg-charcoal py-24">
        <div className="orb orb-primary w-[500px] h-[500px] -top-48 -left-48 opacity-10" />
        <div className="orb orb-gold w-[400px] h-[400px] -bottom-32 -right-32 opacity-10" />
        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <h2 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Ready to build your agent team?
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Sign up free. No credit card. Your agents are waiting.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 bg-gold text-gold-foreground hover:bg-gold/90 shadow-2xl shadow-gold/20 px-8 text-base">
                <Sparkles className="h-5 w-5" /> Build Your Team Free
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/5 text-white hover:bg-white/10 px-8 text-base">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/30 bg-white/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">RA</div>
              <span className="font-heading text-base font-semibold">6thAgent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-semibold">ROSTR</span> + <span className="font-semibold">FPE</span> — Ship. Test. Fix. Repeat.
            </p>
            <p className="text-sm text-muted-foreground">&copy; 2026 6thAgent. Open system. No black box.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
