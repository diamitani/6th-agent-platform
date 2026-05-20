"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createIDEProject, type IDEFile, type IDEProject } from "@/lib/ide"
import { useAppStore } from "@/hooks/use-app-store"
import { Code, FileText, Save, Play, Plus, X, Check, Sparkles, Terminal } from "lucide-react"

export function MiniIDE({ project: initial, onSave }: { project?: IDEProject; onSave?: (p: IDEProject) => void }) {
  const addToast = useAppStore((s) => s.addToast)
  const [project, setProject] = useState<IDEProject>(initial || createIDEProject("My Agent"))
  const [activeFile, setActiveFile] = useState<string>(project.files[0]?.path || "")
  const [output, setOutput] = useState<string>("")

  const currentFile = project.files.find((f) => f.path === activeFile)

  const updateFile = (path: string, content: string) => {
    setProject({
      ...project,
      files: project.files.map((f) => f.path === path ? { ...f, content, saved: false } : f),
      updatedAt: new Date().toISOString(),
    })
  }

  const handleSave = () => {
    setProject({
      ...project,
      files: project.files.map((f) => f.path === activeFile ? { ...f, saved: true } : f),
    })
    onSave?.(project)
    addToast(`💾 ${currentFile?.name} saved`, "success")
  }

  const handleRun = async () => {
    setOutput("> Running agent code...\n")
    try {
      // Simulate execution
      await new Promise((r) => setTimeout(r, 500))
      setOutput((prev) => prev + "> Agent code compiled successfully\n> Ready to handle messages\n")
    } catch (err) {
      setOutput((prev) => prev + `> Error: ${err}\n`)
    }
  }

  const languageColors: Record<string, string> = {
    javascript: "text-yellow-500",
    typescript: "text-blue-500",
    python: "text-green-500",
    json: "text-orange-500",
    markdown: "text-purple-500",
    yaml: "text-red-500",
  }

  return (
    <div className="flex h-full gap-0 rounded-2xl border overflow-hidden bg-card shadow-sm">
      {/* File sidebar */}
      <div className="w-52 border-r border-border/40 bg-parchment/50 p-3 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Files</p>
          <button className="btn-ghost-icon p-1"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        {project.files.map((file) => (
          <button key={file.path} onClick={() => setActiveFile(file.path)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all ${
              activeFile === file.path ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
            }`}>
            <FileText className={`h-3.5 w-3.5 ${languageColors[file.language] || ""}`} />
            <span className="flex-1 text-left truncate">{file.name}</span>
            {!file.saved && <div className="h-2 w-2 rounded-full bg-gold" />}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 bg-parchment/30">
          <div className="flex items-center gap-3">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{currentFile?.name || "No file"}</span>
            {currentFile && (
              <Badge variant="outline" className="text-[10px]">{currentFile.language}</Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleRun} className="gap-1.5 text-xs h-7">
              <Play className="h-3 w-3" /> Run
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 text-xs h-7">
              <Save className="h-3 w-3" /> Save
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-0">
          <textarea
            value={currentFile?.content || ""}
            onChange={(e) => activeFile && updateFile(activeFile, e.target.value)}
            className="w-full h-full min-h-[300px] bg-charcoal text-green-400 font-mono text-sm p-4 resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="border-t border-border/40 bg-charcoal/95 p-3 min-h-[80px]">
          <div className="flex items-center gap-2 mb-1.5">
            <Terminal className="h-3 w-3 text-green-400" />
            <span className="text-[10px] font-mono text-green-400">Output</span>
          </div>
          <pre className="text-xs font-mono text-green-300/80 whitespace-pre-wrap">{output || "> Ready"}</pre>
        </div>
      </div>
    </div>
  )
}
