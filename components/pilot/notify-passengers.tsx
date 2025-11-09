"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type Passenger = {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
}

type Props = {
  flightId: string
}

export default function NotifyPassengers({ flightId }: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const res = await fetch('/api/pilot/passengers')
        if (!res.ok) throw new Error('Failed to fetch passengers')
        const data = await res.json()
        setPassengers(data.passengers || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPassengers()
  }, [])

  const togglePassenger = (passengerId: string) => {
    const newSet = new Set(selectedPassengerIds)
    if (newSet.has(passengerId)) {
      newSet.delete(passengerId)
    } else {
      newSet.add(passengerId)
    }
    setSelectedPassengerIds(newSet)
  }

  const selectAll = () => {
    setSelectedPassengerIds(new Set(passengers.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPassengerIds(new Set())
  }

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    
    if (selectedPassengerIds.size === 0) {
      setError("Please select at least one passenger")
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/pilot/flights/notify', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          flightId,
          passengerIds: Array.from(selectedPassengerIds)
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to send notifications")
      } else {
        setResult(data)
        setSelectedPassengerIds(new Set()) // Clear selection after sending
      }
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (passengers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">
          No passengers have registered under you yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Share your QR code with potential passengers to build your passenger list!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSend} className="space-y-4">
      <div className="flex items-center justify-between">
        <CardDescription>
          Select passengers to notify about this flight via SMS
        </CardDescription>
        <div className="space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
        {passengers.map((passenger) => (
          <div key={passenger.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
            <Checkbox
              id={`passenger-${passenger.id}`}
              checked={selectedPassengerIds.has(passenger.id)}
              onCheckedChange={() => togglePassenger(passenger.id)}
            />
            <Label
              htmlFor={`passenger-${passenger.id}`}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{passenger.fullName}</p>
                  <p className="text-sm text-muted-foreground">{passenger.phone}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>ZIP: {passenger.location}</p>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {result && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-medium text-green-900">{result.message}</p>
        </div>
      )}

      <Button type="submit" disabled={sending || selectedPassengerIds.size === 0} className="w-full">
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending SMS...
          </>
        ) : (
          `Send SMS to ${selectedPassengerIds.size} Passenger${selectedPassengerIds.size !== 1 ? 's' : ''}`
        )}
      </Button>
    </form>
  )
}
