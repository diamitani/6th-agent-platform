// 6thAgent Logging System
// All agent actions, decisions, and system events are logged here
// Structured JSONL format — parseable, queryable, transparent
// New engineers: read logs/ to understand system behavior

type LogLevel = "info" | "warn" | "error" | "debug" | "trace"
type LogNamespace = "system" | "agent" | "chat" | "canvas" | "ide" | "cloud" | "mcp" | "auth" | "deploy" | "payment"

interface LogEntry {
  timestamp: string
  level: LogLevel
  namespace: LogNamespace
  event: string
  message: string
  data?: Record<string, unknown>
  error?: string
  trace?: string
  userId?: string
  orgId?: string
  agentId?: string
  sessionId?: string
  duration_ms?: number
}

let logBuffer: LogEntry[] = []
const MAX_BUFFER = 100

function makeEntry(opts: Omit<LogEntry, "timestamp">): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    ...opts,
  }
}

export function log(entry: Omit<LogEntry, "timestamp">) {
  const e = makeEntry(entry)
  logBuffer.push(e)

  // Console output for dev
  if (process.env.NODE_ENV === "development") {
    const prefix = `[${e.namespace}] ${e.event}:`
    switch (e.level) {
      case "error": console.error(prefix, e.message, e.data || ""); break
      case "warn": console.warn(prefix, e.message, e.data || ""); break
      case "debug": console.debug(prefix, e.message); break
      default: console.log(prefix, e.message)
    }
  }

  // Flush to server if buffer is full
  if (logBuffer.length >= MAX_BUFFER) {
    flush()
  }
}

export async function flush() {
  if (logBuffer.length === 0) return
  const batch = [...logBuffer]
  logBuffer = []

  try {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: batch }),
    })
  } catch (err) {
    console.error("Failed to flush logs:", err)
  }
}

// Convenience methods
export const logger = {
  info: (event: string, message: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "system", event, message, data }),

  warn: (event: string, message: string, data?: Record<string, unknown>) =>
    log({ level: "warn", namespace: "system", event, message, data }),

  error: (event: string, message: string, error?: string, data?: Record<string, unknown>) =>
    log({ level: "error", namespace: "system", event, message, error, data }),

  agent: (event: string, message: string, agentId?: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "agent", event, message, agentId, data }),

  chat: (event: string, message: string, agentId?: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "chat", event, message, agentId, data }),

  canvas: (event: string, message: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "canvas", event, message, data }),

  cloud: (event: string, message: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "cloud", event, message, data }),

  mcp: (event: string, message: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "mcp", event, message, data }),

  deploy: (event: string, message: string, data?: Record<string, unknown>) =>
    log({ level: "info", namespace: "deploy", event, message, data }),
}

// Auto-flush on process exit
if (typeof process !== "undefined") {
  process.on("beforeExit", () => flush())
  process.on("SIGINT", () => { flush(); process.exit(0) })
  process.on("SIGTERM", () => { flush(); process.exit(0) })
}
