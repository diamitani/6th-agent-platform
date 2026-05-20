"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { org_name: orgName } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase.from("users").insert({ id: authData.user.id, email, tier: "free" })

      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      await supabase.from("orgs").insert({
        owner_id: authData.user.id,
        name: orgName,
        slug: `${slug}-${Date.now().toString(36)}`,
        tier: "free",
      })
    }

    router.push("/onboarding")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
            RA
          </div>
          <CardTitle className="font-heading text-2xl">Create your account</CardTitle>
          <CardDescription>Start building your AI agent team</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-light">Organization name</label>
              <Input placeholder="Your company or brand" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-light">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal-light">Password</label>
              <Input type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
