// 6thAgent IDE — Mini Browser-Based Code Editor
// Built on Monaco Editor — write agent logic, transform functions, custom tools

export interface IDEFile {
  name: string
  path: string
  content: string
  language: "javascript" | "typescript" | "python" | "json" | "markdown" | "yaml"
  saved: boolean
}

export interface IDEProject {
  id: string
  name: string
  files: IDEFile[]
  agentId?: string
  createdAt: string
  updatedAt: string
}

export const DEFAULT_IDE_FILES: IDEFile[] = [
  {
    name: "agent.ts",
    path: "/agent.ts",
    content: `// 6thAgent — Agent Logic
// Edit this file to define your agent's behavior.
// The agent function receives messages and returns responses.

export async function handleMessage(message: string, context: any) {
  // Your agent logic here
  // Access tools via context.tools
  // Access knowledge via context.knowledge
  // Access state via context.state

  return {
    response: \`Processing: \${message}\`,
    state: { lastMessage: message }
  }
}
`,
    language: "typescript",
    saved: true,
  },
  {
    name: "tools.ts",
    path: "/tools.ts",
    content: `// Custom Tools for your agent
// Define functions your agent can call

export const tools = {
  getWeather: async (city: string) => {
    // Call weather API
    return { temperature: 72, conditions: "sunny" }
  },

  searchWeb: async (query: string) => {
    // Search the web
    return { results: [] }
  }
}
`,
    language: "typescript",
    saved: true,
  },
  {
    name: "config.json",
    path: "/config.json",
    content: JSON.stringify({
      name: "My Agent",
      version: "1.0.0",
      model: "gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 2048,
      tools: ["getWeather", "searchWeb"],
    }, null, 2),
    language: "json",
    saved: true,
  },
]

export function createIDEProject(name: string, agentId?: string): IDEProject {
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    files: DEFAULT_IDE_FILES.map((f) => ({ ...f })),
    agentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
