import { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const history = messages
      .slice(0, -1)
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        parts: [{ text: m.content }],
      }))

    const lastMsg = messages[messages.length - 1]
    const lastText = typeof lastMsg.content === "string" ? lastMsg.content : lastMsg.content

    if (systemPrompt) {
      const chat = model.startChat({
        history,
        systemInstruction: systemPrompt,
      })
      const result = await chat.sendMessageStream(lastText)
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()
        },
      })
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastText)
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
      },
    })
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err: any) {
    console.error("Gemini stream error:", err)
    return new Response(JSON.stringify({ error: err.message || "Stream failed" }), { status: 500 })
  }
}
