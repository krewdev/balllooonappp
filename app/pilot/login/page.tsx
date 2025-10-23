"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function PilotLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || "Login failed")
        return
      }

      // Store dev token locally (development-only)
      if (data?.token) {
        try {
          localStorage.setItem("dev_token", data.token)
        } catch (e) {
          // ignore storage errors
        }
      }

      // Redirect to dashboard
      router.push("/pilot/dashboard")
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Pilot Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pilot@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-between">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                For development, use <strong>pilot@example.com</strong> / <strong>pilotpass</strong>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
