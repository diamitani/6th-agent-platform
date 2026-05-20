import { NextRequest, NextResponse } from "next/server"
import { generateOllamaStream, checkOllama, OLLAMA_DEFAULTS, type OllamaModel } from "@/lib/ollama"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, model } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 })
    }

    // Check if Ollama is running
    const isRunning = await checkOllama()
    if (!isRunning) {
      return new Response(
        JSON.stringify({
          error: "Ollama not running",
          fix: "Install Ollama: curl -fsSL https://ollama.com/install.sh | bash\nThen pull a model: ollama pull llama3.2\nThen restart: ollama serve",
          docs: "https://ollama.com/download",
        }),
        { status: 503 }
      )
    }

    const ollamaModel = (model as OllamaModel) || OLLAMA_DEFAULTS.model
    const lastMsg = messages[messages.length - 1]
    const prompt = typeof lastMsg.content === "string" ? lastMsg.content : lastMsg.content

    // Build system prompt from context
    const system = systemPrompt || "You are a helpful AI agent in the 6thAgent platform."

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateOllamaStream(prompt, system, {
            ...OLLAMA_DEFAULTS,
            model: ollamaModel,
          })) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream failed"
          controller.enqueue(new TextEncoder().encode(`\n\n[Error: ${msg}]`))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Provider": "ollama",
        "X-Model": ollamaModel,
        "X-Speed-Notice": "Local inference is slower than cloud APIs (~5-20 tokens/sec vs 50-100). Upgrade to Gemini for faster responses.",
      },
    })
  } catch (err: any) {
    console.error("Ollama stream error:", err)
    return new Response(JSON.stringify({ error: err.message || "Ollama stream failed" }), { status: 500 })
  }
}
