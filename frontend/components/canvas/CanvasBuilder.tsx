"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createEmptyWorkflow, addNode, NODE_TYPES, type CanvasNode, type CanvasEdge, type CanvasWorkflow } from "@/lib/canvas"
import { useAppStore } from "@/hooks/use-app-store"
import { Plus, Trash2, GripVertical, Play, Save, Download, ArrowRight, X, Sparkles } from "lucide-react"

export function CanvasBuilder({ workflow: initial, onSave }: { workflow?: CanvasWorkflow; onSave?: (w: CanvasWorkflow) => void }) {
  const addToast = useAppStore((s) => s.addToast)
  const [workflow, setWorkflow] = useState<CanvasWorkflow>(initial || createEmptyWorkflow("Untitled Workflow"))
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleAddNode = (type: CanvasNode["type"]) => {
    const pos = { x: 100 + workflow.nodes.length * 20, y: 100 + workflow.nodes.length * 60 }
    const updated = addNode(workflow, type, pos)
    setWorkflow(updated)
    setSelectedNode(updated.nodes[updated.nodes.length - 1].id)
    addToast(`Added ${type} node`, "info")
  }

  const handleDeleteNode = (id: string) => {
    setWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter((n) => n.id !== id),
      edges: workflow.edges.filter((e) => e.source !== id && e.target !== id),
      updatedAt: new Date().toISOString(),
    })
    setSelectedNode(null)
  }

  const handleConnect = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    const exists = workflow.edges.find((e) => e.source === sourceId && e.target === targetId)
    if (exists) return
    const edge: CanvasEdge = { id: `edge-${Date.now()}`, source: sourceId, target: targetId }
    setWorkflow({ ...workflow, edges: [...workflow.edges, edge], updatedAt: new Date().toISOString() })
    setConnecting(null)
  }

  const handleSave = () => {
    onSave?.(workflow)
    addToast("💾 Workflow saved", "success")
  }

  return (
    <div className="flex h-full gap-4">
      {/* Node Palette */}
      <div className="w-56 shrink-0 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Nodes</p>
        {NODE_TYPES.map((nt) => (
          <button key={nt.type} onClick={() => handleAddNode(nt.type)}
            className="flex w-full items-center gap-3 rounded-xl border border-border/40 bg-card p-3 text-left text-sm transition-all hover:border-primary/30 hover:shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base" style={{ backgroundColor: nt.color + "15" }}>{nt.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs">{nt.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{nt.description}</p>
            </div>
            <Plus className="h-3.5 w-3.5 text-muted-foreground/40" />
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-white/30 p-6 min-h-[500px] relative">
        {workflow.nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-parchment-dark">
                <Sparkles className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Drop nodes from the palette to build your workflow</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {workflow.nodes.map((node, i) => {
              const nt = NODE_TYPES.find((n) => n.type === node.type)
              return (
                <div key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedNode === node.id ? "border-primary/40 bg-primary/5 shadow-md" : "border-border/50 bg-card hover:shadow-sm"
                  }`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab" />
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm" style={{ backgroundColor: nt?.color + "12" }}>{nt?.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{node.label}</p>
                      <Badge variant="secondary" className="text-[10px]">{i === 0 ? "Start" : `Step ${i + 1}`}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{nt?.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setConnecting(node.id) }}
                      className="btn-ghost-icon p-1.5"><ArrowRight className="h-3.5 w-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id) }}
                      className="btn-ghost-icon p-1.5 text-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Connecting mode */}
        {connecting && (
          <div className="absolute inset-0 bg-charcoal/5 rounded-2xl flex items-center justify-center z-10">
            <div className="bg-card rounded-xl border shadow-xl p-6 text-center space-y-4">
              <p className="text-sm font-semibold">Connect <span className="text-primary">{connecting}</span> to...</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {workflow.nodes.filter((n) => n.id !== connecting).map((n) => (
                  <button key={n.id} onClick={() => handleConnect(connecting, n.id)}
                    className="rounded-lg border border-border/50 px-3 py-2 text-xs font-medium hover:border-primary/40 hover:bg-primary/5 transition-all">
                    {n.label}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setConnecting(null)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Edges */}
        {workflow.edges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Connections ({workflow.edges.length})</p>
            <div className="flex flex-wrap gap-2">
              {workflow.edges.map((e) => {
                const src = workflow.nodes.find((n) => n.id === e.source)
                const tgt = workflow.nodes.find((n) => n.id === e.target)
                return (
                  <Badge key={e.id} variant="secondary" className="gap-1 text-[10px]">
                    {src?.label || "?"} <ArrowRight className="h-3 w-3" /> {tgt?.label || "?"}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-40 space-y-2">
        <Button onClick={handleSave} className="w-full gap-2"><Save className="h-4 w-4" /> Save</Button>
        <Button variant="outline" className="w-full gap-2" disabled><Play className="h-4 w-4" /> Run</Button>
        <Button variant="ghost" className="w-full gap-2" disabled><Download className="h-4 w-4" /> Export</Button>
        <div className="mt-4 rounded-xl bg-parchment-dark p-3 text-xs space-y-1.5">
          <p className="font-semibold">{workflow.nodes.length} nodes</p>
          <p className="text-muted-foreground">{workflow.edges.length} connections</p>
        </div>
      </div>
    </div>
  )
}
