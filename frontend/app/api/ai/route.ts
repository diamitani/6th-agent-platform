import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { model, prompt, history } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai")

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const geminiModel = genAI.getGenerativeModel({
      model: model || "gemini-2.5-flash",
      systemInstruction: "You are an AI agent in the Rostr Agent Builder platform. Help the user accomplish their task.",
    })

    const chat = geminiModel.startChat({ history: history || [] })
    const result = await chat.sendMessage(prompt)
    const response = result.response.text()

    return NextResponse.json({ response, provider: "gemini" })
  } catch (err) {
    console.error("Gemini API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gemini API call failed" },
      { status: 500 }
    )
  }
}
