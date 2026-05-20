import { MCPConnector, MCPTool, MCPResource } from "./base"

export class SlackMCP extends MCPConnector {
  id = "slack"
  name = "Slack MCP"
  tools: MCPTool[] = [
    { name: "list_channels", description: "List public channels", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "post_message", description: "Send a message to a channel", parameters: { type: "object", properties: { channel: { type: "string" }, text: { type: "string" } } } },
    { name: "get_channel_history", description: "Get message history from a channel", parameters: { type: "object", properties: { channel: { type: "string" }, limit: { type: "number" } } } },
    { name: "search_messages", description: "Search messages across Slack", parameters: { type: "object", properties: { query: { type: "string" } } } },
    { name: "list_users", description: "List workspace users", parameters: { type: "object", properties: {} } },
    { name: "get_user_info", description: "Get user details", parameters: { type: "object", properties: { user: { type: "string" } } } },
    { name: "create_channel", description: "Create a new channel", parameters: { type: "object", properties: { name: { type: "string" }, is_private: { type: "boolean" } } } },
    { name: "add_reaction", description: "Add an emoji reaction to a message", parameters: { type: "object", properties: { channel: { type: "string" }, timestamp: { type: "string" }, reaction: { type: "string" } } } },
    { name: "upload_file", description: "Upload a file to a channel", parameters: { type: "object", properties: { channel: { type: "string" }, content: { type: "string" }, filename: { type: "string" } } } },
  ]
  resources: MCPResource[] = [
    { uri: "slack://channels", name: "Channels", description: "List of channels" },
    { uri: "slack://users", name: "Users", description: "List of workspace users" },
  ]

  private baseUrl = "https://slack.com/api"

  async connect(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth.test`, {
        headers: { Authorization: `Bearer ${this.config.token}` },
      })
      const data = await res.json()
      return data.ok === true
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {}

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const headers = {
      Authorization: `Bearer ${this.config.token}`,
      "Content-Type": "application/json",
    }

    switch (name) {
      case "list_channels": {
        const { limit = 100 } = params as any
        const res = await fetch(`${this.baseUrl}/conversations.list?limit=${limit}`, { headers })
        return res.json()
      }
      case "post_message": {
        const { channel, text } = params as any
        const res = await fetch(`${this.baseUrl}/chat.postMessage`, {
          method: "POST",
          headers,
          body: JSON.stringify({ channel, text }),
        })
        return res.json()
      }
      case "get_channel_history": {
        const { channel, limit = 50 } = params as any
        const res = await fetch(`${this.baseUrl}/conversations.history?channel=${channel}&limit=${limit}`, { headers })
        return res.json()
      }
      case "search_messages": {
        const { query } = params as any
        const res = await fetch(`${this.baseUrl}/search.messages?query=${encodeURIComponent(query)}`, { headers })
        return res.json()
      }
      case "list_users": {
        const res = await fetch(`${this.baseUrl}/users.list`, { headers })
        return res.json()
      }
      default:
        throw new Error(`Tool ${name} not implemented`)
    }
  }
}
