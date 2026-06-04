"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const PROVIDER_ICONS = {
  ollama: "🆓",
  openai: "⚡",
  gemini: "🔮",
  anthropic: "🟣",
  bedrock: "🟠",
  azure_openai: "🔵",
}

export default function BYOKPage() {
  const [providers, setProviders] = useState([])
  const [configs, setConfigs] = useState({})
  const [selectedProvider, setSelectedProvider] = useState("ollama")
  const [fieldValues, setFieldValues] = useState({})
  const [validationMsg, setValidationMsg] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProviders()
    fetchConfigs()
  }, [])

  const fetchProviders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/byok/providers")
      setProviders(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchConfigs = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/byok/config")
      setConfigs(await res.json() || {})
    } catch (e) { console.error(e) }
  }

  const handleValidate = async () => {
    const provider = providers.find(p => p.id === selectedProvider)
    if (!provider) return

    const keyField = provider.fields.find(f => f.type === "password")
    if (!keyField || !fieldValues[keyField.key]) {
      setValidationMsg("Enter an API key to validate")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/byok/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, key: fieldValues[keyField.key] }),
      })
      const data = await res.json()
      setValidationMsg(data.valid ? "✅ Key is valid!" : `❌ ${data.message}`)
    } catch (e) {
      setValidationMsg(`❌ ${e.message}`)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch("http://localhost:8000/api/byok/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, config: fieldValues }),
      })
      setValidationMsg("✅ Configuration saved!")
      await fetchConfigs()
    } catch (e) {
      setValidationMsg(`❌ ${e.message}`)
    }
    setLoading(false)
  }

  const currentProvider = providers.find(p => p.id === selectedProvider)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">BYOK — Bring Your Own Key</h1>
        <p className="text-muted-foreground mt-1">
          Connect your own LLM provider. Free local with Ollama, or bring keys for OpenAI, Gemini, Claude, and more.
        </p>
      </div>

      {validationMsg && (
        <div className="p-3 border rounded-lg bg-secondary/50 text-sm">{validationMsg}</div>
      )}

      <Tabs value={selectedProvider} onValueChange={setSelectedProvider}>
        <TabsList className="flex-wrap">
          {providers.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className="gap-1.5">
              <span>{PROVIDER_ICONS[p.id] || "🔌"}</span>
              <span>{p.label}</span>
              {configs[p.id] && <Badge variant="outline" className="ml-1 text-[10px]">✓</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {providers.map((p) => (
          <TabsContent key={p.id} value={p.id} className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{PROVIDER_ICONS[p.id] || "🔌"}</span>
                      {p.label}
                    </CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">Cost: {p.cost}</span>
                    <span className="text-muted-foreground">Privacy: {p.privacy}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {p.fields?.map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium mb-1 block">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        className="w-full p-2 border rounded-md bg-background"
                        value={fieldValues[field.key] || field.default || ""}
                        onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={field.type || "text"}
                        placeholder={field.default || `Enter your ${p.label} ${field.label}`}
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                {p.id === "ollama" ? (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg text-sm">
                    ✅ Ollama runs locally — no API key needed. Already configured.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleValidate} disabled={loading}>
                      Validate Key
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      Save Configuration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Configured Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(configs).length === 0 ? (
            <p className="text-sm text-muted-foreground">No providers configured yet. Select a provider above and save your API key.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(configs).map(([id, cfg]) => (
                <Badge key={id} variant="secondary" className="gap-1">
                  <span>{PROVIDER_ICONS[id] || "🔌"}</span>
                  {providers.find(p => p.id === id)?.label || id}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
