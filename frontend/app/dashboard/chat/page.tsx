"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/hooks/use-app-store"
import { Send, Bot, User, Loader2, Sparkles, MessageSquare, ChevronRight, BookOpen, ExternalLink, Server, Zap, Cpu } from "lucide-react"
import type { Agent } from "@/types"

type AIProvider = "ollama" | "gemini"
type Message = { role: "user" | "assistant"; content: string }

export default function ChatPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [provider, setProvider] = useState<AIProvider>("ollama")
  const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null)
  const [providerSpeed, setProviderSpeed] = useState<"fast" | "moderate" | "slow">("slow")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/agents").then((r) => r.json()).then((d) => setAgents(d.agents || [])).catch(() => {})
    checkOllama()
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const checkOllama = async () => {
    try {
      const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(2000) })
      setOllamaRunning(res.ok)
      if (res.ok) setProviderSpeed("moderate")
    } catch {
      setOllamaRunning(false)
      setProvider("gemini")
      setProviderSpeed("fast")
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setLoading(true)

    try {
      const sysPrompt = selectedAgent?.system_prompt
        ? `You are ${selectedAgent.name}, ${selectedAgent.role}.\n\n${selectedAgent.system_prompt}`
        : undefined

      // Route to provider
      const endpoint = provider === "ollama" ? "/api/chat/ollama" : "/api/chat/gemini-stream"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: userMsg }],
          systemPrompt: sysPrompt,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.fix) {
          addToast(`Ollama not running. Install: ollama.com/download`, "error")
          setShowGuide(true)
          return
        }
        throw new Error(err.error || "Request failed")
      }

      const speedNotice = res.headers.get("X-Speed-Notice")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      let assistantMsg = ""
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        assistantMsg += text
        setMessages((prev) => {
          const u = [...prev]
          u[u.length - 1] = { role: "assistant", content: assistantMsg }
          return u
        })
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Chat failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Chat</h2>
            <button onClick={() => setShowGuide(!showGuide)} className="text-xs text-primary hover:underline">
              {showGuide ? "Close" : "Guide"}
            </button>
          </div>

          {/* Provider selector */}
          <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">AI Provider</p>
            <div className="flex gap-2">
              <button onClick={() => setProvider("ollama")}
                className={`flex-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  provider === "ollama" ? "bg-primary text-white shadow-sm" : "bg-parchment-dark text-muted-foreground hover:bg-muted"
                }`}>
                <Cpu className="h-3.5 w-3.5" />
                Ollama
                {ollamaRunning === true && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />}
                {ollamaRunning === false && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400" />}
              </button>
              <button onClick={() => setProvider("gemini")}
                className={`flex-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  provider === "gemini" ? "bg-primary text-white shadow-sm" : "bg-parchment-dark text-muted-foreground hover:bg-muted"
                }`}>
                <Zap className="h-3.5 w-3.5" />
                Gemini
              </button>
            </div>
            {provider === "ollama" && ollamaRunning === true && (
              <p className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Local • Free • Slower
              </p>
            )}
            {provider === "ollama" && ollamaRunning === false && (
              <p className="text-[10px] text-red-500">Ollama not detected — install for free local AI</p>
            )}
            {provider === "gemini" && (
              <p className="text-[10px] text-blue-500 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Cloud • Fast • API key required
              </p>
            )}
          </div>

          {/* Agents */}
          {agents.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">Your Agents</p>
              {agents.map((agent) => (
                <button key={agent.id} onClick={() => { setSelectedAgent(agent); setMessages([]) }}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    selectedAgent?.id === agent.id
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-transparent bg-card hover:border-muted-foreground/20 hover:shadow-sm"
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{agent.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.triggers?.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Guide panel */}
          {showGuide && (
            <div className="rounded-xl border border-border/40 bg-card p-4 text-sm space-y-3">
              <p className="font-semibold flex items-center gap-2">
                <Server className="h-4 w-4" /> Free Setup
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-charcoal">Option A: Ollama (Free, Local)</p>
                <ol className="space-y-1.5 list-decimal pl-4">
                  <li><code className="bg-charcoal/5 px-1 rounded">curl -fsSL https://ollama.com/install.sh | bash</code></li>
                  <li><code className="bg-charcoal/5 px-1 rounded">ollama pull llama3.2</code></li>
                  <li><code className="bg-charcoal/5 px-1 rounded">ollama serve</code></li>
                </ol>
                <p className="text-[10px] text-muted-foreground/60 mt-1">⚠️ Local inference is slower (5-20 tok/s). Best for dev + testing.</p>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                <p className="font-medium text-charcoal">Option B: Gemini (Cloud, Fast)</p>
                <ol className="space-y-1.5 list-decimal pl-4">
                  <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">aistudio.google.com</a></li>
                  <li>Create API Key → add to <code className="bg-charcoal/5 px-1 rounded">.env.local</code></li>
                </ol>
                <p className="text-[10px] text-muted-foreground/60 mt-1">⚡ Cloud inference: 50-100 tok/s. Rate limit: 60 req/min free.</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/40 px-6 py-4 bg-gradient-to-r from-card to-parchment/30">
            {selectedAgent ? (
              <>
                <span className="text-2xl">{selectedAgent.emoji}</span>
                <div>
                  <p className="font-heading font-semibold">{selectedAgent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAgent.role}
                    <span className="mx-1.5">·</span>
                    {provider === "ollama" ? "Ollama (local)" : "Gemini (cloud)"}
                    {provider === "ollama" && <span className="ml-1.5 text-[10px] text-amber-500">slower</span>}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold via-gold/80 to-primary text-white shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading font-semibold">6thAgent Chat</p>
                  <p className="text-xs text-muted-foreground">
                    {provider === "ollama" ? "Ollama (free, local)" : "Gemini (cloud)"}
                    {provider === "ollama" && <span className="ml-1.5 text-amber-500 text-[10px]">⚠️ slower responses</span>}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-parchment-dark">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {provider === "ollama" ? (
                      <>Chatting with <strong>Ollama</strong> (free, local). Responses are slower than cloud APIs but completely free and private.</>
                    ) : (
                      <>Chatting with <strong>Gemini</strong> (cloud). Fast responses via API key.</>
                    )}
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-parchment-dark text-charcoal rounded-tl-md"
                }`}>
                  {msg.content || <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal/10">
                    <User className="h-4 w-4 text-charcoal-light" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/40 p-4 bg-gradient-to-t from-parchment/30 to-transparent">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={provider === "ollama" ? "Chat with Ollama (free, local, slower)..." : "Chat with Gemini (fast, cloud)..."}
                  disabled={loading}
                  className="input-field w-full pr-20"
                />
                {provider === "ollama" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-500 font-medium">🐢 local</span>
                )}
                {provider === "gemini" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-500 font-medium">⚡ cloud</span>
                )}
              </div>
              <Button type="submit" disabled={loading || !input.trim()} className="h-12 w-12 rounded-xl p-0">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
