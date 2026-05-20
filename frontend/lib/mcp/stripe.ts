import { MCPConnector, MCPTool, MCPResource } from "./base"

export class StripeMCP extends MCPConnector {
  id = "stripe"
  name = "Stripe MCP"
  tools: MCPTool[] = [
    { name: "list_customers", description: "List customers", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "get_customer", description: "Get customer by ID", parameters: { type: "object", properties: { id: { type: "string" } } } },
    { name: "list_invoices", description: "List invoices", parameters: { type: "object", properties: { customer: { type: "string" }, limit: { type: "number" } } } },
    { name: "list_subscriptions", description: "List subscriptions", parameters: { type: "object", properties: { customer: { type: "string" }, limit: { type: "number" } } } },
    { name: "list_products", description: "List products", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "list_prices", description: "List prices", parameters: { type: "object", properties: { product: { type: "string" } } } },
    { name: "get_balance", description: "Get account balance", parameters: { type: "object", properties: {} } },
    { name: "list_charges", description: "List recent charges", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "list_payouts", description: "List payouts", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    { name: "create_invoice", description: "Create a new invoice", parameters: { type: "object", properties: { customer: { type: "string" }, days_until_due: { type: "number" } } } },
  ]
  resources: MCPResource[] = [
    { uri: "stripe://customers", name: "All Customers" },
    { uri: "stripe://products", name: "All Products" },
    { uri: "stripe://balance", name: "Account Balance" },
  ]

  private baseUrl = "https://api.stripe.com/v1"

  async connect(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/balance`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      })
      return res.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {}

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const headers = { Authorization: `Bearer ${this.config.apiKey}` }

    const get = async (path: string) => {
      const res = await fetch(`${this.baseUrl}${path}`, { headers })
      return res.json()
    }

    switch (name) {
      case "list_customers": return get(`/customers?limit=${(params as any).limit || 10}`)
      case "get_customer": return get(`/customers/${(params as any).id}`)
      case "list_invoices": return get(`/invoices?customer=${(params as any).customer}&limit=${(params as any).limit || 10}`)
      case "list_subscriptions": return get(`/subscriptions?customer=${(params as any).customer}&limit=${(params as any).limit || 10}`)
      case "list_products": return get(`/products?limit=${(params as any).limit || 10}`)
      case "list_prices": return get(`/prices?product=${(params as any).product}&limit=10`)
      case "get_balance": return get("/balance")
      case "list_charges": return get(`/charges?limit=${(params as any).limit || 10}`)
      case "list_payouts": return get(`/payouts?limit=${(params as any).limit || 10}`)
      default:
        throw new Error(`Tool ${name} not implemented`)
    }
  }
}
