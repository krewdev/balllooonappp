"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  flightId: string
  defaultMessage?: string
}

export default function NotifyPassengers({ flightId, defaultMessage }: Props) {
  const [phones, setPhones] = useState("")
  const [message, setMessage] = useState(defaultMessage || "")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const list = phones
      .split(/[,\n\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (list.length === 0) {
      setError("Add at least one phone number")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/flight/${flightId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhones: list, message }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data?.error || "Failed to send notifications")
      } else {
        setResult(data)
      }
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notify Passengers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSend} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Phone numbers</label>
            <textarea
              className="w-full rounded-md border bg-background p-2 text-sm"
              rows={3}
              placeholder="Comma, space, or newline separated (e.g. 5551234567, 555-222-3333)"
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message (optional)</label>
            <textarea
              className="w-full rounded-md border bg-background p-2 text-sm"
              rows={3}
              placeholder="Custom SMS message; a booking link will be included automatically if omitted."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send SMS"}</Button>
          </div>
          {result && (
            <div className="rounded-md border p-2 text-sm">
              <p className="font-medium">Sent</p>
              <ul className="mt-1 list-disc pl-5">
                {(result.results || []).map((r: any, i: number) => (
                  <li key={i}>
                    {r.to}: {r.error ? `Error: ${r.error}` : r.sid ? `Sent (sid: ${r.sid})` : r.mocked ? "Mocked" : "OK"}
                  </li>
                ))}
              </ul>
              {Array.isArray(result.invalid) && result.invalid.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Invalid numbers (not sent)</p>
                  <ul className="mt-1 list-disc pl-5">
                    {result.invalid.map((n: string, i: number) => (
                      <li key={`inv-${i}`}>{n}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-muted-foreground">Use full international format (e.g. +15551234567). 10-digit numbers are sent as US +1 by default.</p>
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
