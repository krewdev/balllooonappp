"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Pilot = {
  id: string
  fullName: string | null
  email: string | null
  phone: string | null
  createdAt: string
  // Client-side state for UI changes
  verificationStatus?: "pending" | "approved" | "rejected"
  // Add other fields from your data model that you want to display
  licenseNumber?: string | null
  licenseExpiry?: string | null
  yearsExperience?: number | null
  totalFlightHours?: number | null
  insuranceProvider?: string | null
  insurancePolicyNumber?: string | null
  insuranceExpiry?: string | null
  balloonRegistration?: string | null
  balloonCapacity?: number | null
}

export function PilotApprovalList() {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingPilots = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/pilots/pending", {
          headers: {
            // This is for local dev convenience, can be removed if you have proper session management
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
          },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`)
        }
        const data = await res.json()
        setPilots(data.map((p: Pilot) => ({ ...p, verificationStatus: "pending" })))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingPilots()
  }, [])

  const handleApprove = async (pilotId: string) => {
    setProcessingId(pilotId)
    setError(null)
    try {
      const res = await fetch("/api/admin/pilots/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({ id: pilotId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to approve pilot")
      }

      // Remove the pilot from the list on successful approval
      setPilots((prev) => prev.filter((p) => p.id !== pilotId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (pilotId: string) => {
    setProcessingId(pilotId)
    // TODO: Implement rejection logic when the API endpoint is ready
    console.warn("Rejection functionality not yet implemented.")
    // Simulate API call for now and update UI
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPilots((prev) => prev.map((p) => (p.id === pilotId ? { ...p, verificationStatus: "rejected" as const } : p)))
    setProcessingId(null)
  }

  const pendingPilots = pilots.filter((p) => p.verificationStatus === "pending")

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p>Loading pending pilots...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <X className="mb-2 h-8 w-8 text-destructive" />
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {pendingPilots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pending pilot applications</p>
          </CardContent>
        </Card>
      ) : (
        pendingPilots.map((pilot) => (
          <Card key={pilot.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{pilot.fullName || "N/A"}</CardTitle>
                  <CardDescription>Submitted on {new Date(pilot.createdAt).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{pilot.email || "N/A"}</p>
                  <p className="text-sm">{pilot.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License</p>
                  <p className="font-medium">{pilot.licenseNumber}</p>
                  <p className="text-sm">
                    Expires: {pilot.licenseExpiry ? new Date(pilot.licenseExpiry).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{pilot.yearsExperience} years</p>
                  <p className="text-sm">{pilot.totalFlightHours} flight hours</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurance</p>
                  <p className="font-medium">{pilot.insuranceProvider}</p>
                  <p className="text-sm">{pilot.insurancePolicyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balloon</p>
                  <p className="font-medium">{pilot.balloonRegistration}</p>
                  <p className="text-sm">Capacity: {pilot.balloonCapacity} passengers</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Pilot Application Details</DialogTitle>
                      <DialogDescription>Complete information for {pilot.fullName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium">Full Name</p>
                          <p className="text-sm text-muted-foreground">{pilot.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{pilot.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{pilot.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">License Number</p>
                          <p className="text-sm text-muted-foreground">{pilot.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">License Expiry</p>
                          <p className="text-sm text-muted-foreground">
                            {pilot.licenseExpiry ? new Date(pilot.licenseExpiry).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Years of Experience</p>
                          <p className="text-sm text-muted-foreground">{pilot.yearsExperience}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Flight Hours</p>
                          <p className="text-sm text-muted-foreground">{pilot.totalFlightHours}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Insurance Provider</p>
                          <p className="text-sm text-muted-foreground">{pilot.insuranceProvider}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Insurance Policy Number</p>
                          <p className="text-sm text-muted-foreground">{pilot.insurancePolicyNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Insurance Expiry</p>
                          <p className="text-sm text-muted-foreground">
                            {pilot.insuranceExpiry ? new Date(pilot.insuranceExpiry).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Balloon Registration</p>
                          <p className="text-sm text-muted-foreground">{pilot.balloonRegistration}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Balloon Capacity</p>
                          <p className="text-sm text-muted-foreground">{pilot.balloonCapacity} passengers</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="default"
                  onClick={() => handleApprove(pilot.id)}
                  disabled={processingId === pilot.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingId === pilot.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Approve
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => handleReject(pilot.id)}
                  disabled={processingId === pilot.id}
                >
                  {processingId === pilot.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
