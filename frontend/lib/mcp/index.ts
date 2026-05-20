export { MCPConnector } from "./base"
export type { MCPTool, MCPResource, MCPConnection } from "./base"
export { GitHubMCP } from "./github"
export { SlackMCP } from "./slack"
export { StripeMCP } from "./stripe"

export function getMCPConnector(id: string, config?: Record<string, string>) {
  const { GitHubMCP } = require("./github")
  const { SlackMCP } = require("./slack")
  const { StripeMCP } = require("./stripe")

  switch (id) {
    case "github":
      return new GitHubMCP(config)
    case "slack":
      return new SlackMCP(config)
    case "stripe":
      return new StripeMCP(config)
    case "hubspot":
      return new (require("./hubspot").HubSpotMCP)(config)
    case "notion":
      return new (require("./notion").NotionMCP)(config)
    case "google_sheets":
      return new (require("./google-sheets").GoogleSheetsMCP)(config)
    default:
      return null
  }
}
