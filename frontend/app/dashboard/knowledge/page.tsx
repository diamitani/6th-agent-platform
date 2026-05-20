"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/hooks/use-app-store"
import { BookOpen, Plus, Search, FileText, Sparkles } from "lucide-react"

const DOC_TYPES = ["SOUL", "ICP", "GTM", "Competitor", "Playbook", "Research", "Agent", "Product"]

export default function KnowledgePage() {
  const addToast = useAppStore((s) => s.addToast)
  const [title, setTitle] = useState("")
  const [docType, setDocType] = useState("Research")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)
  const [docs, setDocs] = useState<any[]>([])

  const handleSave = async () => {
    if (!title || !content) { addToast("Title and content required", "error"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, doc_type: docType, content, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
      })
      if (!res.ok) throw new Error("Failed")
      addToast(`📚 ${title} saved`, "success")
      setTitle(""); setContent(""); setTags(""); setDocType("Research")
    } catch { addToast("Failed to save", "error") }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">Shared knowledge accessible by all your agents</p>
          </div>
        </div>
        <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" /><input className="input-field pl-11" placeholder="Search knowledge base..." /></div>
        <Card className="border-t-4 border-t-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Plus className="h-5 w-5 text-primary" /> New Document</CardTitle>
            <CardDescription>Add knowledge your agents can reference</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input className="input-field" placeholder="e.g. ICP — Independent Artists" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea placeholder="Paste or write your knowledge document..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <input className="input-field" placeholder="e.g. icp, artists, marketing" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2"><Sparkles className="h-4 w-4" />{saving ? "Saving..." : "Save to Knowledge Base"}</Button>
          </CardContent>
        </Card>
        {docs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">Your knowledge base is empty</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
