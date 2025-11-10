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

type Flight = {
  id: string
  title: string
  date: string
  location: string
  priceCents: number
  stripePayLink: string
  pilot: {
    fullName: string | null
    phone: string | null
  }
}

type Props = {
  flightId: string
}

export default function NotifyPassengers({ flightId }: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [flight, setFlight] = useState<Flight | null>(null)
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<Set<string>>(new Set())
  const [customMessage, setCustomMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [passengersRes, flightRes] = await Promise.all([
          fetch('/api/pilot/passengers'),
          fetch(`/api/flight/${flightId}`)
        ])
        
        if (!passengersRes.ok) throw new Error('Failed to fetch passengers')
        if (!flightRes.ok) throw new Error('Failed to fetch flight details')
        
        const passengersData = await passengersRes.json()
        const flightData = await flightRes.json()
        
        setPassengers(passengersData.passengers || [])
        setFlight(flightData)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [flightId])

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
          passengerIds: Array.from(selectedPassengerIds),
          customMessage: customMessage.trim()
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Failed to send notifications")
      } else {
        setResult(data)
        setSelectedPassengerIds(new Set()) // Clear selection after sending
        setCustomMessage("") // Clear custom message
      }
    } catch (e: any) {
      setError(e?.message || "Unexpected error")
    } finally {
      setSending(false)
    }
  }

  const getPreviewMessage = () => {
    if (!flight) return ""
    
    const pilotName = flight.pilot.fullName || "Your pilot"
    const flightDate = new Date(flight.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    const price = (flight.priceCents / 100).toFixed(2)
    
  let message = `Hello [Passenger Name]!\n\n${pilotName} has a hot air balloon flight available.\n\n${flight.title}\n${flightDate}\n${flight.location}\n$${price}`
    
    if (customMessage) {
      message += `\n\n${customMessage}`
    }
    
  message += `\n\nReserve your spot: ${flight.stripePayLink}`
    
    return message
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
    <form onSubmit={onSend} className="space-y-6">
      {/* Message Preview */}
      {flight && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Message Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm font-mono bg-white dark:bg-slate-900 text-foreground p-4 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
              {getPreviewMessage()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Message */}
      <div className="space-y-2">
        <Label htmlFor="customMessage">Add Custom Message (Optional)</Label>
        <textarea
          id="customMessage"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Add a personal note to your passengers..."
          className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground">
          {customMessage.length}/300 characters
        </p>
      </div>

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
