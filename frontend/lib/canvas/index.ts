// 6thAgent Canvas — Visual Agent Workflow Builder
// Drag-and-drop agent orchestration canvas

export interface CanvasNode {
  id: string
  type: "trigger" | "action" | "condition" | "llm" | "tool" | "output" | "delay" | "webhook"
  label: string
  position: { x: number; y: number }
  config: Record<string, unknown>
  agentId?: string
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  label?: string
  condition?: string
}

export interface CanvasWorkflow {
  id: string
  name: string
  description?: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  createdAt: string
  updatedAt: string
  orgId?: string
}

export const NODE_TYPES = [
  { type: "trigger" as const, label: "Trigger", icon: "⚡", color: "#B08324", description: "Starts the workflow" },
  { type: "llm" as const, label: "LLM Call", icon: "🧠", color: "#7C3AED", description: "Call an AI model" },
  { type: "action" as const, label: "Action", icon: "🔧", color: "#2563EB", description: "Perform an action" },
  { type: "condition" as const, label: "Condition", icon: "🔀", color: "#D97706", description: "Branch logic" },
  { type: "tool" as const, label: "Tool", icon: "🔌", color: "#059669", description: "Use an integration tool" },
  { type: "webhook" as const, label: "Webhook", icon: "🔄", color: "#0891B2", description: "HTTP webhook call" },
  { type: "delay" as const, label: "Delay", icon: "⏱️", color: "#57564F", description: "Wait before next step" },
  { type: "output" as const, label: "Output", icon: "📤", color: "#C96442", description: "Return result" },
]

export function createEmptyWorkflow(name: string): CanvasWorkflow {
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function addNode(workflow: CanvasWorkflow, type: CanvasNode["type"], position: { x: number; y: number }): CanvasWorkflow {
  const nodeType = NODE_TYPES.find((n) => n.type === type)
  const node: CanvasNode = {
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    label: nodeType?.label || type,
    position,
    config: {},
  }
  return { ...workflow, nodes: [...workflow.nodes, node], updatedAt: new Date().toISOString() }
}
