// 6thAgent — Ollama Provider
// Free, local, open-source AI inference
// Runs on your machine — no API keys, no rate limits, no data leaving your network
// Models: llama3, mistral, deepseek-coder, phi3, gemma2 and 100+ more

export type OllamaModel =
  | "llama3.2"
  | "llama3.1"
  | "mistral"
  | "deepseek-coder-v2"
  | "phi3"
  | "gemma2"
  | "qwen2.5"
  | "codellama"
  | "mixtral"
  | "neural-chat"

export interface OllamaConfig {
  baseUrl: string
  model: OllamaModel
  temperature?: number
  maxTokens?: number
}

export const OLLAMA_DEFAULTS: OllamaConfig = {
  baseUrl: "http://localhost:11434",
  model: "llama3.2",
  temperature: 0.7,
  maxTokens: 2048,
}

export const OLLAMA_MODELS: { id: OllamaModel; name: string; size: string; description: string; speed: string }[] = [
  { id: "llama3.2", name: "Llama 3.2", size: "3B", description: "Fast, lightweight, great for chat", speed: "⚡ Fast" },
  { id: "llama3.1", name: "Llama 3.1", size: "8B", description: "Balanced quality and speed", speed: "⚡ Fast" },
  { id: "mistral", name: "Mistral", size: "7B", description: "Strong reasoning, compact", speed: "⚡ Fast" },
  { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", size: "16B", description: "Best for code generation", speed: "🐢 Slower" },
  { id: "phi3", name: "Phi-3", size: "3.8B", description: "Microsoft small model, fast", speed: "⚡ Very Fast" },
  { id: "gemma2", name: "Gemma 2", size: "9B", description: "Google's open model, strong", speed: "⏸️ Moderate" },
  { id: "qwen2.5", name: "Qwen 2.5", size: "7B", description: "Strong multilingual support", speed: "⏸️ Moderate" },
  { id: "mixtral", name: "Mixtral", size: "8x7B", description: "MoE, high quality, needs RAM", speed: "🐢 Slower" },
]

export interface OllamaCompletionRequest {
  model: OllamaModel
  prompt: string
  system?: string
  stream?: boolean
  options?: {
    temperature?: number
    max_tokens?: number
    top_p?: number
  }
}

export async function checkOllama(config: OllamaConfig = OLLAMA_DEFAULTS): Promise<boolean> {
  try {
    const res = await fetch(`${config.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function getOllamaModels(config: OllamaConfig = OLLAMA_DEFAULTS): Promise<string[]> {
  try {
    const res = await fetch(`${config.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return []
    const data = await res.json()
    return data.models?.map((m: any) => m.name) || []
  } catch {
    return []
  }
}

export async function generateOllama(
  prompt: string,
  system?: string,
  config: OllamaConfig = OLLAMA_DEFAULTS
): Promise<string> {
  const body: OllamaCompletionRequest = {
    model: config.model,
    prompt,
    system,
    options: {
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    },
  }

  const res = await fetch(`${config.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.statusText}`)
  }

  // Ollama returns NDJSON — accumulate the response
  const text = await res.text()
  const lines = text.trim().split("\n")
  let fullResponse = ""

  for (const line of lines) {
    try {
      const chunk = JSON.parse(line)
      if (chunk.response) fullResponse += chunk.response
      if (chunk.done) break
    } catch {}
  }

  return fullResponse
}

export async function* generateOllamaStream(
  prompt: string,
  system?: string,
  config: OllamaConfig = OLLAMA_DEFAULTS
): AsyncGenerator<string> {
  const body: OllamaCompletionRequest = {
    model: config.model,
    prompt,
    system,
    stream: true,
    options: {
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    },
  }

  const res = await fetch(`${config.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`)

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const chunk = JSON.parse(line)
        if (chunk.response) yield chunk.response
        if (chunk.done) return
      } catch {}
    }
  }
}
