import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Check, Star, Bot, MessageSquare, BookOpen, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E8E4DE] bg-[#FAF9F7]/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/CA.png" alt="6thAgent" className="h-8 w-auto" />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">How it works</a>
            <a href="#features" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">Features</a>
            <Link href="/auth/login" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">Sign in</Link>
            <Link href="/auth/signup">
              <Button className="rounded-full bg-[#1A1A1A] text-white hover:bg-[#333] px-5 text-sm h-9 gap-1.5">
                Build your first agent free <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-[#FF6B00]/5 border border-[#FF6B00]/10 px-4 py-1.5">
              <span className="text-xs font-medium text-[#FF6B00]">Introducing 6thAgent</span>
            </div>

            <h1 className="font-['Georgia',serif] text-4xl font-bold leading-[1.15] text-[#1A1A1A] md:text-5xl lg:text-6xl tracking-tight">
              Describe what you need.
              <br />
              <span className="text-[#FF6B00]">Get a working agent.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base md:text-lg text-[#6B6B6B] leading-relaxed">
              Type what you want an agent to do — in plain English.
              We build it. System prompt, triggers, behavior. Ready to talk.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/auth/signup">
                <Button className="rounded-full bg-[#1A1A1A] text-white hover:bg-[#333] px-7 h-11 text-sm gap-2 shadow-lg">
                  <Sparkles className="h-4 w-4" /> Build your first agent free
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" className="rounded-full border-[#D4D0CA] text-[#4A4A4A] hover:bg-[#F0EDE8] px-6 h-11 text-sm gap-2">
                  See how it works <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>

            <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[#8B8B8B]">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#FF6B00]" /> No prompt engineering</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#FF6B00]" /> Free local AI included</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#FF6B00]" /> No credit card</span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="mt-14 mx-auto max-w-4xl">
            <div className="rounded-2xl border border-[#E8E4DE] bg-white shadow-xl shadow-black/[0.02] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#F0EDE8] px-5 py-3 bg-[#FAF9F7]/50">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#E8E4DE]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#E8E4DE]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#E8E4DE]" />
                </div>
                <span className="ml-3 text-xs text-[#8B8B8B] font-mono">6thAgent — Agent Builder</span>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-[#8B8B8B]">Describe your agent below</span>
                </div>
                <div className="rounded-xl bg-[#FAF9F7] border border-[#E8E4DE] p-5">
                  <p className="text-sm text-[#8B8B8B] mb-2">What should this agent do?</p>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed">
                    "I need an agent that sends 30 personalized DMs per day on Instagram, LinkedIn, and Twitter.
                    It should follow a 3-touch sequence and require my approval before sending."
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] p-3">
                    <p className="text-[10px] text-[#8B8B8B] uppercase tracking-wider font-semibold">Domain</p>
                    <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">Sales / Outreach</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] p-3">
                    <p className="text-[10px] text-[#8B8B8B] uppercase tracking-wider font-semibold">Triggers</p>
                    <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">DM, Outreach, Follow-up</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] p-3">
                    <p className="text-[10px] text-[#8B8B8B] uppercase tracking-wider font-semibold">Constraint</p>
                    <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">Approval required</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-[#1A1A1A] text-white px-5 py-2.5 text-xs font-semibold shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" /> Compile Agent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 md:py-28 bg-white border-y border-[#E8E4DE]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="font-['Georgia',serif] text-3xl font-bold text-[#1A1A1A] md:text-4xl tracking-tight">
              Three sentences. That's it.
            </h2>
            <p className="mt-3 text-[#6B6B6B] text-base">
              Building an agent shouldn't take hours of prompt engineering. Describe what you need. We handle the rest.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "01", title: "Describe your agent", desc: "What should it do? Who is it for? Write it in plain English. The more detail you give, the better it gets.", color: "#FF6B00" },
              { n: "02", title: "We build it", desc: "Our compiler reads your description and generates the complete agent — system prompt, triggers, behavior rules, output format.", color: "#D94F00" },
              { n: "03", title: "Chat with it", desc: "Your agent is live. Toggle between free local AI (Ollama) or cloud (Gemini). Edit, refine, or build more.", color: "#1A1A1A" },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF9F7] border border-[#E8E4DE] text-lg font-bold" style={{ color: s.color }}>
                  {s.n}
                </div>
                <h3 className="font-['Georgia',serif] text-xl font-bold text-[#1A1A1A]">{s.title}</h3>
                <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES — Clean editorial grid */}
      <section id="features" className="py-20 md:py-28 bg-[#FAF9F7]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-['Georgia',serif] text-3xl font-bold text-[#1A1A1A] md:text-4xl tracking-tight">
              What you get
            </h2>
            <p className="mt-3 text-[#6B6B6B] text-base">
              Every agent comes with everything it needs to work. No assembly required.
            </p>
          </div>

          <div className="mt-12 grid gap-px bg-[#E8E4DE] border border-[#E8E4DE] rounded-2xl overflow-hidden md:grid-cols-3">
            {[
              { title: "Agent Builder", desc: "Describe what you need. We compile it into a working agent with system prompt, triggers, and behavior profile." },
              { title: "Pre-built Templates", desc: "9 agent archetypes: Chief of Staff, Marketing, DM Agent, Research, Sales, Support, Social, Ads, Builder." },
              { title: "Chat with Streaming", desc: "Real-time conversations with any agent. Toggle between Ollama (local, free) or Gemini (cloud, free tier)." },
              { title: "Knowledge Base", desc: "Shared context across all agents. Upload docs, define ICP, set brand voice. Every agent reads from the same source." },
              { title: "Reference Hub", desc: "Org identity, positioning, playbooks — automatically injected into every agent's system prompt." },
              { title: "Free AI Included", desc: "No API key required. Ollama runs locally for free. Gemini free tier if you want cloud speed. Your choice." },
            ].map((f) => (
              <div key={f.title} className="bg-white p-6 md:p-7">
                <h3 className="font-['Georgia',serif] text-lg font-bold text-[#1A1A1A]">{f.title}</h3>
                <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES SHOWCASE */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#8B8B8B] uppercase tracking-widest">Pre-built agents</p>
            <h2 className="mt-2 font-['Georgia',serif] text-2xl font-bold text-[#1A1A1A]">Ready to use. Or build your own.</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            {[
              { emoji: "🎯", name: "Chief of Staff" },
              { emoji: "📊", name: "Marketing" },
              { emoji: "💬", name: "DM Agent" },
              { emoji: "✍️", name: "Content Writer" },
              { emoji: "🔍", name: "Research" },
            ].map((a) => (
              <Link key={a.name} href="/auth/signup"
                className="flex items-center gap-3 rounded-xl border border-[#E8E4DE] bg-white p-4 transition-all hover:border-[#D4D0CA] hover:shadow-sm">
                <span className="text-xl">{a.emoji}</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{a.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 md:py-24 bg-[#FAF9F7] border-y border-[#E8E4DE]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { q: "I typed what I needed and had a working agent in 30 seconds. No prompt engineering, no tutorials, nothing.", name: "Marcus J.", role: "Founder", initials: "MJ" },
              { q: "The only platform that compiles natural language into actual agent logic. Tried CrewAI, tried LangChain. This is different.", name: "Sarah K.", role: "Agency Owner", initials: "SK" },
              { q: "My DM agent went from idea to sending messages in 5 minutes. The approval gate feature was detected automatically.", name: "Devon T.", role: "Solo Founder", initials: "DT" },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white border border-[#E8E4DE] p-6">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />)}
                </div>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">"{t.q}"</p>
                <div className="mt-4 pt-4 border-t border-[#F0EDE8] flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-xs font-semibold text-white">{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{t.name}</p>
                    <p className="text-xs text-[#8B8B8B]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / HOW IT DEEPLY WORKS */}
      <section className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#8B8B8B] uppercase tracking-widest">Behind the scenes</p>
            <h2 className="mt-2 font-['Georgia',serif] text-3xl font-bold text-[#1A1A1A] md:text-4xl tracking-tight">
              Natural language in. Agent manifest out.
            </h2>
            <p className="mt-3 text-[#6B6B6B] max-w-xl mx-auto">
              Here's what our compiler does when you describe an agent. You don't need to understand this to use it — but if you're curious:
            </p>
          </div>

          <div className="space-y-6">
            {[
              { n: 1, title: "We read your description", desc: "We extract what domain your agent works in (Sales, Marketing, Operations), what constraints apply, what triggers activate it, and what output format it needs. Your words, structured." },
              { n: 2, title: "We add your context", desc: "Your organization's identity, ICP, and knowledge base are loaded automatically. Every agent you build already knows what your business does and who it serves." },
              { n: 3, title: "We sharpen the instructions", desc: "Vague verbs become precise rules. 'Reach out to people' becomes 'Send 30 personalized messages per day across Instagram, LinkedIn, and Twitter.' Missing steps get added. Edge cases get handled." },
              { n: 4, title: "We build the agent", desc: "System prompt. Trigger words. Behavior profile. Completion criteria. All compiled into a working agent. No templates. No manual configuration." },
              { n: 5, title: "You get the keys", desc: "Your agent is on your roster. Start talking immediately. Edit it, refine it, or build more. It remembers context across sessions." },
            ].map((s) => (
              <div key={s.n} className="flex gap-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF9F7] border border-[#E8E4DE] text-xs font-semibold text-[#6B6B6B]">{s.n}</div>
                <div>
                  <h3 className="font-['Georgia',serif] text-lg font-semibold text-[#1A1A1A]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[#6B6B6B] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#1A1A1A]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-['Georgia',serif] text-3xl font-bold text-white md:text-4xl tracking-tight">
            Your first agent is one description away
          </h2>
          <p className="mt-4 text-[#8B8B8B] text-base max-w-lg mx-auto">
            Free. No credit card. No API key required. Type what you need and get a working agent.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/auth/signup">
              <Button className="rounded-full bg-white text-[#1A1A1A] hover:bg-[#E8E4DE] px-7 h-11 text-sm gap-2 shadow-lg font-semibold">
                <Sparkles className="h-4 w-4" /> Build your first agent free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-[#FAF9F7] border-t border-[#E8E4DE]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/CA.png" alt="6thAgent" className="h-6 w-auto" />
            </div>
            <p className="text-sm text-[#8B8B8B]">
              Natural language in. Agent manifest out.
            </p>
            <p className="text-xs text-[#A8A8A8]">&copy; 2026 6thAgent. Free to use. Open system.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
