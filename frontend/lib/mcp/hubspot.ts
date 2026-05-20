import { MCPConnector, MCPTool, MCPResource } from "./base"

export class HubSpotMCP extends MCPConnector {
  id = "hubspot"
  name = "HubSpot MCP"
  tools: MCPTool[] = [
    { name: "list_contacts", description: "List CRM contacts", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "get_contact", description: "Get contact by ID", parameters: { type: "object", properties: { id: { type: "string" } } } },
    { name: "search_contacts", description: "Search contacts by query", parameters: { type: "object", properties: { query: { type: "string" } } } },
    { name: "list_companies", description: "List companies", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "list_deals", description: "List deals in pipeline", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "create_contact", description: "Create a new contact", parameters: { type: "object", properties: { email: { type: "string" }, firstname: { type: "string" }, lastname: { type: "string" } } } },
    { name: "create_deal", description: "Create a new deal", parameters: { type: "object", properties: { dealname: { type: "string" }, amount: { type: "number" }, pipeline: { type: "string" } } } },
    { name: "get_pipeline_stages", description: "Get pipeline stages", parameters: { type: "object", properties: {} } },
    { name: "list_engagements", description: "List recent engagements", parameters: { type: "object", properties: { limit: { type: "number" } } } },
  ]
  resources: MCPResource[] = [
    { uri: "hubspot://contacts", name: "Contacts", description: "All CRM contacts" },
    { uri: "hubspot://deals", name: "Deals", description: "All deals in pipeline" },
    { uri: "hubspot://companies", name: "Companies", description: "All companies" },
  ]

  private baseUrl = "https://api.hubapi.com/crm/v3"

  async connect(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/objects/contacts?limit=1`, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })
      return res.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {}

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const headers = { Authorization: `Bearer ${this.config.accessToken}`, "Content-Type": "application/json" }
    const get = async (path: string) => { const r = await fetch(path, { headers }); return r.json() }
    const post = async (path: string, body: any) => { const r = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) }); return r.json() }

    switch (name) {
      case "list_contacts": return get(`${this.baseUrl}/objects/contacts?limit=${(params as any).limit || 10}`)
      case "get_contact": return get(`${this.baseUrl}/objects/contacts/${(params as any).id}`)
      case "search_contacts": return post(`${this.baseUrl}/objects/contacts/search`, { query: (params as any).query })
      case "list_companies": return get(`${this.baseUrl}/objects/companies?limit=${(params as any).limit || 10}`)
      case "list_deals": return get(`${this.baseUrl}/objects/deals?limit=${(params as any).limit || 10}`)
      case "create_contact": return post(`${this.baseUrl}/objects/contacts`, { properties: { email: (params as any).email, firstname: (params as any).firstname, lastname: (params as any).lastname } })
      default: throw new Error(`Tool ${name} not implemented`)
    }
  }
}
