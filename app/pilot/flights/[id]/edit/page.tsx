"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Loader2 } from "lucide-react"

export default function EditFlightPage() {
  const params = useParams()
  const router = useRouter()
  const flightId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    price: "",
    maxPassengers: "4",
    description: "",
  })

  useEffect(() => {
    fetchFlight()
  }, [flightId])

  const fetchFlight = async () => {
    try {
      const res = await fetch(`/api/flight/${flightId}`, { credentials: "include" })
      if (!res.ok) {
        if (res.status === 404) {
          setError("Flight not found")
        } else {
          setError("Failed to load flight")
        }
        return
      }
      const flight = await res.json()
      setFormData({
        title: flight.title || "",
        date: flight.date ? new Date(flight.date).toISOString().slice(0, 16) : "",
        location: flight.location || "",
        price: flight.priceCents ? (flight.priceCents / 100).toString() : "",
        maxPassengers: flight.maxPassengers?.toString() || "4",
        description: flight.description || "",
      })
    } catch (err) {
      setError("Failed to load flight")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/flight/${flightId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          date: formData.date,
          location: formData.location,
          priceCents: Math.round(parseFloat(formData.price || "0") * 100),
          maxPassengers: parseInt(formData.maxPassengers || "4", 10),
          description: formData.description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update flight")
      }

      router.push(`/pilot/flights/${flightId}`)
    } catch (err: any) {
      setError(err.message || "Failed to update flight")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Edit Flight</h1>
        <BackButton />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Flight Details</CardTitle>
          <CardDescription>Update your flight information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Flight Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPassengers">Max Passengers</Label>
                <Input
                  id="maxPassengers"
                  type="number"
                  min="1"
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/pilot/flights/${flightId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

