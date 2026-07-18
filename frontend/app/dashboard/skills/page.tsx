"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/hooks/use-app-store"
import {
  ArrowLeft, Check, Copy, Loader2, Sparkles, Zap, Wand2,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import {
  ENABLY_PACK, ENABLY_SKILLS, SKILL_CATEGORIES, compileSkillPrompt,
  type Skill,
} from "@/lib/skills/enably"

export default function SkillsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [category, setCategory] = useState<string>("all")
  const [active, setActive] = useState<Skill | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string>("")

  const visible = ENABLY_SKILLS.filter((s) => category === "all" || s.category === category)

  const openSkill = (skill: Skill) => {
    setActive(skill)
    setValues({})
    setOutput("")
  }

  const canRun = active?.inputs.filter((i) => i.required).every((i) => values[i.id]?.trim())

  const runSkill = async () => {
    if (!active) return
    setRunning(true)
    setOutput("")
    const prompt = compileSkillPrompt(active, values)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok || !data.response) throw new Error(data.error || "Skill run failed")
      setOutput(data.response)
      addToast(`${active.emoji} ${active.name} complete`, "success")
    } catch (err) {
      // No model configured — hand the operator the compiled prompt instead.
      setOutput(
        `> **No AI provider configured** — here is your PAL-compiled prompt. Paste it into any agent chat, or set \`GEMINI_API_KEY\` to run skills natively.\n\n---\n\n\`\`\`\n${prompt}\n\`\`\``
      )
      addToast(err instanceof Error ? err.message : "Provider unavailable — compiled prompt ready", "error")
    } finally {
      setRunning(false)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    addToast("Copied to clipboard", "success")
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Wand2 className="h-7 w-7 text-[#FF6B00]" />
              <h1 className="font-heading text-3xl font-bold">Skills</h1>
              <Badge variant="gold" className="text-[10px] font-semibold uppercase tracking-widest">
                Enably GTM Pack
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-muted-foreground">{ENABLY_PACK.mission}</p>
          </div>
        </div>

        {!active && (
          <>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  category === "all" ? "bg-charcoal text-white shadow-sm" : "bg-parchment-dark text-muted-foreground hover:text-charcoal"
                }`}
              >
                All ({ENABLY_SKILLS.length})
              </button>
              {Object.entries(SKILL_CATEGORIES).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    category === key ? "text-white shadow-sm" : "bg-parchment-dark text-muted-foreground hover:text-charcoal"
                  }`}
                  style={category === key ? { backgroundColor: meta.color } : undefined}
                >
                  {meta.label}
                </button>
              ))}
            </div>

            {/* Skill grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {visible.map((skill) => {
                const meta = SKILL_CATEGORIES[skill.category]
                return (
                  <button
                    key={skill.id}
                    onClick={() => openSkill(skill)}
                    className="command-card group p-5 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: meta.color + "12", border: `1px solid ${meta.color}25` }}
                      >
                        {skill.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-base font-bold">{skill.name}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{skill.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]" style={{ color: meta.color }}>
                            {meta.label}
                          </Badge>
                          <span className="mono-data text-[10px] text-muted-foreground/60">{skill.action}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              Skills are PAL-compiled actions from the Enably GTM Architect — structured inputs in, execution-ready output out.
              Constraints: {ENABLY_PACK.constraints.join(" ")}
            </p>
          </>
        )}

        {/* Skill runner */}
        {active && (
          <div className="space-y-5">
            <button
              onClick={() => setActive(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" /> All skills
            </button>

            <div className="command-card p-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: SKILL_CATEGORIES[active.category].color + "12" }}
                >
                  {active.emoji}
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold">{active.name}</h2>
                  <p className="text-sm text-muted-foreground">{active.description}</p>
                  <p className="mono-data mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    output: {active.outputFormat}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {active.inputs.map((input) => (
                  <div key={input.id} className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {input.label}
                      {input.required && <span className="ml-1 text-[#FF6B00]">*</span>}
                    </label>
                    {input.multiline ? (
                      <Textarea
                        rows={3}
                        placeholder={input.placeholder}
                        value={values[input.id] || ""}
                        onChange={(e) => setValues((v) => ({ ...v, [input.id]: e.target.value }))}
                      />
                    ) : (
                      <input
                        className="input-field"
                        placeholder={input.placeholder}
                        value={values[input.id] || ""}
                        onChange={(e) => setValues((v) => ({ ...v, [input.id]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}

                <Button onClick={runSkill} disabled={!canRun || running} className="w-full gap-2 shadow-lg shadow-[#FF6B00]/20">
                  {running ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Running skill…</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Run {active.name}</>
                  )}
                </Button>
              </div>
            </div>

            {output && (
              <div className="command-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <Check className="h-4 w-4" /> Output
                  </p>
                  <Button variant="outline" size="sm" onClick={copyOutput} className="gap-1.5">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none prose-headings:font-heading prose-pre:bg-charcoal prose-pre:text-xs">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
