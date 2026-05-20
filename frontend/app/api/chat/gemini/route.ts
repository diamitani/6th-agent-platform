import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt || "You are a helpful AI agent.",
    })

    const result = await model.generateContent(message)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (err) {
    console.error("Gemini API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
