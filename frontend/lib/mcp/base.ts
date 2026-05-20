// MCP (Model Context Protocol) Base Connector
// All MCP integrations extend this class to provide tool access to agents

export interface MCPTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface MCPConnection {
  id: string
  integrationId: string
  name: string
  config: Record<string, string>
  tools: MCPTool[]
  resources: MCPResource[]
  connected: boolean
  lastSync?: string
}

export abstract class MCPConnector {
  abstract id: string
  abstract name: string
  abstract tools: MCPTool[]
  abstract resources: MCPResource[]

  protected config: Record<string, string> = {}

  constructor(config?: Record<string, string>) {
    if (config) this.config = config
  }

  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract executeTool(name: string, params: Record<string, unknown>): Promise<unknown>

  getSummary(): MCPConnection {
    return {
      id: this.id,
      integrationId: this.id,
      name: this.name,
      config: this.config,
      tools: this.tools,
      resources: this.resources,
      connected: false,
    }
  }
}
