import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { workflow } = await req.json()

    if (!workflow || !workflow.nodes) {
      return NextResponse.json({ error: "workflow with nodes required" }, { status: 400 })
    }

    // Validate workflow
    const errors: string[] = []
    const hasTrigger = workflow.nodes.some((n: any) => n.type === "trigger")
    if (!hasTrigger) errors.push("Workflow must have a trigger node")

    // Check for disconnected nodes
    const connected = new Set<string>()
    workflow.edges?.forEach((e: any) => { connected.add(e.source); connected.add(e.target) })
    workflow.nodes.forEach((n: any) => {
      if (!connected.has(n.id) && workflow.nodes.length > 1) {
        errors.push(`Node "${n.label}" is disconnected`)
      }
    })

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      nodeCount: workflow.nodes.length,
      edgeCount: workflow.edges?.length || 0,
      workflow,
    })
  } catch (err) {
    return NextResponse.json({ error: "Workflow validation failed" }, { status: 500 })
  }
}
