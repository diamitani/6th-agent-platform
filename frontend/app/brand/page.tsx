import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function BrandPage() {
  const colors = [
    { name: "Champion Orange", hex: "#FF6B00", rgb: "rgb(255,107,0)" },
    { name: "Orange Burst", hex: "#FF8C00", rgb: "rgb(255,140,0)" },
    { name: "Orange Deep", hex: "#E85D00", rgb: "rgb(232,93,0)" },
    { name: "Orange Glow", hex: "#FFF0E0", rgb: "rgb(255,240,224)" },
    { name: "Charcoal", hex: "#1A1A1A", rgb: "rgb(26,26,26)" },
    { name: "Gold", hex: "#F5C100", rgb: "rgb(245,193,0)" },
    { name: "Parchment", hex: "#F9F6EF", rgb: "rgb(249,246,239)" },
  ]

  return (
    <div className="min-h-screen bg-parchment">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-16 text-center">
          <img src="/favicon.svg" alt="6thAgent" className="mx-auto h-24 w-24 mb-6" />
          <h1 className="font-heading text-5xl font-bold">6thAgent</h1>
          <p className="mt-2 text-xl text-muted-foreground">Brand Guidelines — Your sixth man.</p>
          <p className="mt-1 text-sm text-muted-foreground">Athletic · Champion · Winner · Hardest worker in the room.</p>
        </div>

        {/* Logo variations */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Logo Variations</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-8 flex items-center justify-center">
              <img src="/favicon.svg" alt="6thAgent Icon" className="h-32 w-32" />
            </div>
            <div className="rounded-2xl border bg-card p-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160" width="400" height="107">
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B00"/><stop offset="50%" stopColor="#FF8C00"/><stop offset="100%" stopColor="#E85D00"/></linearGradient></defs>
                <g transform="translate(5,5)scale(0.37)"><circle cx="200" cy="200" r="150" fill="#FF6B00" opacity="0.04"/><path d="M 200 55 C 280 55 345 120 345 200 C 345 280 280 345 200 345 C 120 345 55 280 55 200 C 55 120 120 55 200 55 Z" fill="none" stroke="url(#rg)" strokeWidth="24" strokeLinecap="round"/><path d="M 320 260 C 305 310 265 340 200 345" fill="none" stroke="url(#rg)" strokeWidth="24" strokeLinecap="round"/><polygon points="200,140 158,260 200,238 242,260" fill="#1A1A1A" stroke="#FF6B00" strokeWidth="2" strokeOpacity="0.25"/><line x1="175" y1="232" x2="225" y2="232" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round"/><ellipse cx="178" cy="178" rx="8" ry="5" fill="#FF6B00" opacity="0.35" transform="rotate(-30 178 178)"/></g>
                <text x="230" y="52" fontFamily="Inter,sans-serif" fontSize="52" fontWeight="800" fill="#1A1A1A" letterSpacing="-1.5">6<tspan fontSize="36" fontWeight="700" fill="#FF6B00" letterSpacing="-0.5">th</tspan></text>
                <text x="230" y="97" fontFamily="Inter,sans-serif" fontSize="40" fontWeight="300" fill="#4A4A4A" letterSpacing="6">AGENT</text>
                <text x="232" y="122" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="500" fill="#FF6B00" letterSpacing="4">YOUR SIXTH MAN</text>
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Primary icon (left) · Horizontal lockup (right) · See <code className="bg-charcoal/5 px-1.5 rounded">brand/assets/</code> for all variations
          </p>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Color Palette</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {colors.map((c) => (
              <div key={c.hex} className="rounded-2xl border bg-card overflow-hidden">
                <div className="h-24" style={{ backgroundColor: c.hex }} />
                <div className="p-4 text-sm">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">{c.hex}</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{c.rgb}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Taglines */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Taglines</h2>
          <div className="space-y-4">
            {[
              { tag: "Your sixth man.", usage: "Primary — brand tagline", size: "text-4xl" },
              { tag: "Extra man on the roster.", usage: "Secondary — feature messaging", size: "text-3xl" },
              { tag: "Hardest worker in the room.", usage: "Internal culture", size: "text-2xl" },
              { tag: "Champion's agent platform.", usage: "Enterprise positioning", size: "text-2xl" },
            ].map((t) => (
              <div key={t.tag} className="rounded-xl border bg-card p-5">
                <p className={`font-heading font-bold ${t.size}`} style={{ color: t.tag === "Your sixth man." ? "#FF6B00" : "#1A1A1A" }}>{t.tag}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.usage}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Voice */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Brand Voice</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Coach-like", desc: "Direct, encouraging, no BS" },
              { label: "Champion mindset", desc: "We don't make excuses. We make progress." },
              { label: "Athletic cadence", desc: "Short sentences. Active voice. Period." },
              { label: "The Sixth Man", desc: "Humbling. We win as a team." },
            ].map((v) => (
              <div key={v.label} className="rounded-xl border bg-card p-5">
                <p className="font-semibold">{v.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Story */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Brand Story</h2>
          <div className="rounded-2xl border bg-card p-8 text-lg leading-relaxed space-y-4 italic text-muted-foreground">
            <p><span className="text-4xl font-heading text-[#FF6B00]">"</span>Every great team has one. Not the MVP. Not the starter. The one who comes off the bench and changes everything.</p>
            <p><strong className="not-italic text-charcoal">The sixth man.</strong></p>
            <p>6thAgent is that player for your business. Not replacing your team — elevating them. The hardest worker. The one who studies the playbook, runs the drills, and shows up every single day without being told.</p>
            <p>Built on ROSTR. Driven by FPE. Powered by open-source AI. No lock-in. No excuses. Just results.</p>
            <p className="font-heading text-2xl not-italic font-bold text-[#FF6B00]">6thAgent — Your sixth man.</p>
          </div>
        </section>

        <div className="text-center border-t border-border/40 pt-8">
          <p className="text-sm text-muted-foreground">Full brand guidelines in <code className="bg-charcoal/5 px-1.5 rounded">brand/guidelines/BRAND.md</code></p>
          <p className="text-xs text-muted-foreground mt-1">Assets in <code className="bg-charcoal/5 px-1.5 rounded">brand/assets/</code></p>
          <Link href="/"><Button variant="outline" className="mt-4">Back to App</Button></Link>
        </div>
      </div>
    </div>
  )
}
