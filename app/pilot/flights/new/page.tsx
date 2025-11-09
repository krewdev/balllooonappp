"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Passenger } from "@prisma/client"

export default function NewFlightPage() {
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    price: "",
    maxPassengers: "4",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"form" | "notify">("form")
  const [createdFlight, setCreatedFlight] = useState<any>(null)

  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([])
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPassengers() {
      try {
        const res = await fetch("/api/pilot/passengers", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          // API returns { passengers: [...] } — handle both shapes for robustness
          const list = data?.passengers || data || [];
          setPassengers(list);
        }
      } catch (error) {
        console.error("Failed to fetch passengers", error);
      }
    }
    fetchPassengers();
  }, []);

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const handleFlightCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/pilot/flights/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with the request
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          location: form.location,
          priceCents: Math.round(parseFloat(form.price || "0") * 100),
          maxPassengers: parseInt(form.maxPassengers || "4", 10),
          description: form.description,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create flight")
      setCreatedFlight(data.flight)
      setStep("notify")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPassengers(passengers.map((p) => p.id))
    } else {
      setSelectedPassengers([])
    }
  }

  const handleNotify = async () => {
    if (selectedPassengers.length === 0) {
      alert("Please select at least one passenger to notify.");
      return;
    }
    setLoading(true);
    setNotificationStatus("Sending notifications...");
    try {
      const res = await fetch("/api/pilot/flights/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with the request
        body: JSON.stringify({
          flightId: createdFlight.id,
          passengerIds: selectedPassengers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send notifications");
      setNotificationStatus(data.message || "Notifications sent successfully!");
    } catch (error: any) {
      setNotificationStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <BackButton />
        </div>
        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Flight</CardTitle>
              <CardDescription>
                Fill in the details for your new flight. After creation, you'll be able to notify your subscribed
                passengers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFlightCreation} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxPassengers">Max Passengers</Label>
                  <Input
                    id="maxPassengers"
                    type="number"
                    value={form.maxPassengers}
                    onChange={(e) => update("maxPassengers", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>

                <div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Flight & Proceed to Notify"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "notify" && createdFlight && (
          <Card>
            <CardHeader>
              <CardTitle>Notify Passengers</CardTitle>
              <CardDescription>
                Select which of your subscribed passengers you'd like to notify about this new flight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2 rounded-md border bg-muted/50 p-4">
                <h4 className="font-semibold">{createdFlight.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(createdFlight.date).toLocaleString()} at {createdFlight.location}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <Label className="font-semibold">Passengers ({passengers.length})</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      checked={selectedPassengers.length === passengers.length && passengers.length > 0}
                    />
                    <Label htmlFor="select-all">Select All</Label>
                  </div>
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {passengers.map((passenger) => (
                    <div key={passenger.id} className="flex items-center gap-3 rounded-md border p-3">
                      <Checkbox
                        id={`p-${passenger.id}`}
                        checked={selectedPassengers.includes(passenger.id)}
                        onCheckedChange={(checked) => {
                          setSelectedPassengers((prev) =>
                            checked ? [...prev, passenger.id] : prev.filter((id) => id !== passenger.id)
                          )
                        }}
                      />
                      <div>
                        <Label htmlFor={`p-${passenger.id}`} className="font-medium">
                          {passenger.fullName}
                        </Label>
                        <p className="text-xs text-muted-foreground">{passenger.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleNotify} disabled={loading} className="mt-6 w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  `Notify ${selectedPassengers.length} Passenger(s)`
                )}
              </Button>
              {notificationStatus && <p className="mt-4 text-center text-sm text-muted-foreground">{notificationStatus}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
