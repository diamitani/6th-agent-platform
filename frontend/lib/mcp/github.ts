import { MCPConnector, MCPTool, MCPResource } from "./base"

export class GitHubMCP extends MCPConnector {
  id = "github"
  name = "GitHub MCP"
  tools: MCPTool[] = [
    { name: "list_repos", description: "List repositories for the authenticated user", parameters: { type: "object", properties: {} } },
    { name: "get_repo", description: "Get repository details", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } } } },
    { name: "list_issues", description: "List issues for a repository", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, state: { type: "string", enum: ["open", "closed", "all"] } } } },
    { name: "create_issue", description: "Create a new issue", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, title: { type: "string" }, body: { type: "string" } } } },
    { name: "list_prs", description: "List pull requests", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, state: { type: "string", enum: ["open", "closed", "all"] } } } },
    { name: "get_commit", description: "Get a commit", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, ref: { type: "string" } } } },
    { name: "search_code", description: "Search code across repositories", parameters: { type: "object", properties: { query: { type: "string" } } } },
    { name: "get_file", description: "Get file contents from a repo", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, path: { type: "string" }, ref: { type: "string" } } } },
    { name: "create_branch", description: "Create a new branch", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, name: { type: "string" }, from_branch: { type: "string" } } } },
    { name: "list_workflows", description: "List GitHub Actions workflows", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" } } } },
    { name: "trigger_workflow", description: "Trigger a GitHub Actions workflow", parameters: { type: "object", properties: { owner: { type: "string" }, repo: { type: "string" }, workflow_id: { type: "string" }, ref: { type: "string" } } } },
  ]
  resources: MCPResource[] = [
    { uri: "github://repos", name: "All Repositories", description: "List of all repositories" },
    { uri: "github://issues", name: "All Issues", description: "Issues across repositories" },
  ]

  private baseUrl = "https://api.github.com"

  async connect(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/user`, {
        headers: { Authorization: `Bearer ${this.config.token}` },
      })
      return res.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {
    // No session to clear
  }

  async executeTool(name: string, params: Record<string, unknown>): Promise<unknown> {
    const headers = {
      Authorization: `Bearer ${this.config.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    }

    switch (name) {
      case "list_repos": {
        const res = await fetch(`${this.baseUrl}/user/repos?per_page=100`, { headers })
        return res.json()
      }
      case "get_repo": {
        const { owner, repo } = params as any
        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, { headers })
        return res.json()
      }
      case "list_issues": {
        const { owner, repo, state = "open" } = params as any
        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?state=${state}`, { headers })
        return res.json()
      }
      case "create_issue": {
        const { owner, repo, title, body } = params as any
        const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title, body }),
        })
        return res.json()
      }
      case "search_code": {
        const { query } = params as any
        const res = await fetch(`${this.baseUrl}/search/code?q=${encodeURIComponent(query)}`, { headers })
        return res.json()
      }
      case "get_file": {
        const { owner, repo, path, ref } = params as any
        const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ""}`
        const res = await fetch(url, { headers })
        return res.json()
      }
      default:
        throw new Error(`Tool ${name} not implemented`)
    }
  }
}
