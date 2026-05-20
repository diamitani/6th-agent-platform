"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HardDrive, Upload, FileText, Database, Sparkles } from "lucide-react"

export default function StoragePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-heading text-3xl font-bold">Storage</h1>
            <p className="text-muted-foreground">Upload and manage files for your agents</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Database, label: "Used", value: "0 MB", sub: "of 100 MB", color: "text-primary" },
            { icon: FileText, label: "Files", value: "0", sub: "uploaded", color: "text-blue-500" },
            { icon: HardDrive, label: "OpenAI Files", value: "0", sub: "synced", color: "text-green-500" },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-6 text-center"><s.icon className={`mx-auto mb-3 h-8 w-8 ${s.color}`} /><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.sub}</p></CardContent></Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Upload File</CardTitle><CardDescription>Upload PDFs, text files, or images for your agents</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 p-12 transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
              <Upload className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium">Drag and drop files here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse (PDF, TXT, MD, CSV, JSON)</p>
              <Button variant="outline" className="mt-4" disabled>Upload</Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 p-12 text-center"><HardDrive className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No files uploaded yet</p></div>
      </div>
    </DashboardLayout>
  )
}
