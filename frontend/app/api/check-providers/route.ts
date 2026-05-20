import { NextResponse } from "next/server"

export async function GET() {
  // Check Ollama
  let ollama = { available: false, models: [] as string[], error: null as string | null }
  try {
    const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) })
    if (res.ok) {
      const data = await res.json()
      ollama.available = true
      ollama.models = data.models?.map((m: any) => m.name) || []
    }
  } catch (e) {
    ollama.error = "Ollama not running on localhost:11434"
  }

  // Check Gemini
  const geminiKey = process.env.GEMINI_API_KEY
  let gemini = { available: false, tier: "none" as string }
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`,
        { signal: AbortSignal.timeout(3000) }
      )
      gemini.available = res.ok
      gemini.tier = res.ok ? "active" : "invalid"
    } catch {
      gemini.tier = "error"
    }
  }

  // Check OpenAI
  const openaiKey = process.env.OPENAI_API_KEY
  let openai = { available: false }
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openaiKey}` },
        signal: AbortSignal.timeout(3000),
      })
      openai.available = res.ok
    } catch {}
  }

  return NextResponse.json({
    providers: {
      ollama: {
        ...ollama,
        setup: "curl -fsSL https://ollama.com/install.sh | bash && ollama pull llama3.2 && ollama serve",
        docs: "https://ollama.com/download",
        cost: "free",
        speed: "slow",
        note: "5-20 tok/s. Runs entirely on your machine. No data leaves your network.",
      },
      gemini: {
        ...gemini,
        setup: "Go to https://aistudio.google.com/apikey → Create API Key → add to .env.local as GEMINI_API_KEY",
        docs: "https://aistudio.google.com/apikey",
        cost: "free tier (60 req/min, 1500 req/day)",
        speed: "fast",
        note: "50-100 tok/s. Cloud inference. Requires internet.",
      },
      openai: {
        ...openai,
        setup: "Go to https://platform.openai.com/api-keys → Create key → add to .env.local as OPENAI_API_KEY",
        docs: "https://platform.openai.com/api-keys",
        cost: "paid (usage-based)",
        speed: "fast",
        note: "Fastest option. Requires billing.",
      },
    },
    defaultProvider: ollama.available ? "ollama" : gemini.available ? "gemini" : "none",
  })
}
