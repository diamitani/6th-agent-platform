import { GoogleGenerativeAI, Content } from "@google/generative-ai"
import { AIProvider } from "@/types"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function runGeminiAgent(
  systemPrompt: string,
  userMessage: string,
  history: Content[] = []
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  })

  const chat = model.startChat({ history })
  const result = await chat.sendMessage(userMessage)
  return result.response.text()
}

export function getModelForProvider(provider: AIProvider) {
  switch (provider) {
    case "openai":
      return "gpt-4o"
    case "gemini":
      return "gemini-2.5-flash"
    case "user_key":
      return "user-provided"
  }
}
