// MCP (Model Context Protocol) Integration Hub
// 6thAgent — Connect any service via OAuth + MCP

export interface MCPIntegration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  authType: "oauth" | "apikey" | "webhook" | "none"
  docsUrl: string
  mcpServer?: string
  tools: MCPTool[]
  connected: boolean
  config?: Record<string, string>
}

export interface MCPTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  redirectUri: string
}

export class MCPHub {
  private integrations: Map<string, MCPIntegration> = new Map()
  private oauthConfigs: Map<string, OAuthConfig> = new Map()

  register(integration: MCPIntegration) {
    this.integrations.set(integration.id, integration)
  }

  registerOAuth(integrationId: string, config: OAuthConfig) {
    this.oauthConfigs.set(integrationId, config)
  }

  get(id: string): MCPIntegration | undefined {
    return this.integrations.get(id)
  }

  list(category?: string): MCPIntegration[] {
    const all = Array.from(this.integrations.values())
    return category ? all.filter((i) => i.category === category) : all
  }

  getOAuthUrl(integrationId: string): string | null {
    const config = this.oauthConfigs.get(integrationId)
    if (!config) return null
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: config.scopes.join(" "),
    })
    return `${config.authUrl}?${params.toString()}`
  }

  async connect(integrationId: string, authCode?: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId)
    if (!integration) return false

    const oauth = this.oauthConfigs.get(integrationId)
    if (oauth && authCode) {
      // Exchange auth code for tokens
      try {
        const res = await fetch(oauth.tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: oauth.clientId,
            client_secret: oauth.clientSecret,
            code: authCode,
            grant_type: "authorization_code",
            redirect_uri: oauth.redirectUri,
          }),
        })
        if (!res.ok) return false
        const tokens = await res.json()
        integration.config = { access_token: tokens.access_token, refresh_token: tokens.refresh_token }
      } catch {
        return false
      }
    }

    integration.connected = true
    this.integrations.set(integrationId, integration)
    return true
  }

  async disconnect(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      integration.connected = false
      integration.config = undefined
      this.integrations.set(integrationId, integration)
    }
  }

  async callTool(integrationId: string, toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const integration = this.integrations.get(integrationId)
    if (!integration || !integration.connected) {
      throw new Error(`Integration ${integrationId} not connected`)
    }

    // Route via MCP server or direct API
    if (integration.mcpServer) {
      return this.callMCP(integration, toolName, params)
    }

    throw new Error(`No MCP server configured for ${integrationId}`)
  }

  private async callMCP(integration: MCPIntegration, toolName: string, params: Record<string, unknown>): Promise<unknown> {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (integration.config?.access_token) {
      headers["Authorization"] = `Bearer ${integration.config.access_token}`
    }

    const res = await fetch(`${integration.mcpServer}/tools/${toolName}`, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    })

    if (!res.ok) throw new Error(`MCP call failed: ${res.statusText}`)
    return res.json()
  }
}

export const mcpHub = new MCPHub()
