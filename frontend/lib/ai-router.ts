import { AIProvider, Agent, ChatRequest, ChatResponse } from "@/types"

type RouterCallback = (message: string) => void

export async function routeAgentMessage(
  provider: AIProvider,
  agent: Agent,
  message: string,
  threadId?: string,
  onStream?: RouterCallback
): Promise<ChatResponse> {
  switch (provider) {
    case "openai":
      return callOpenAIAssistant(agent, message, threadId, onStream)
    case "gemini":
      return callGeminiAgent(agent, message)
    case "user_key":
      throw new Error("User-provided key mode not implemented yet")
    default:
      return callOpenAIAssistant(agent, message, threadId, onStream)
  }
}

async function callOpenAIAssistant(
  agent: Agent,
  message: string,
  threadId?: string,
  onStream?: RouterCallback
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: agent.id,
      message,
      threadId,
    } satisfies ChatRequest),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to call assistant")
  }

  const data: ChatResponse = await res.json()
  return data
}

async function callGeminiAgent(
  agent: Agent,
  message: string
): Promise<ChatResponse> {
  const res = await fetch("/api/chat/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId: agent.id,
      message,
      systemPrompt: agent.system_prompt,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to call Gemini")
  }

  const data = await res.json()
  return { response: data.response, threadId: `gemini-${agent.id}-${Date.now()}` }
}
