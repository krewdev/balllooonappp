"use client"

import { useState } from "react"
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

export function PilotApprovalList() {
  const [pilots, setPilots] = useState([
    {
      id: "1",
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      licenseNumber: "FAA-12345678",
      licenseExpiry: "2026-12-31",
      yearsExperience: 10,
      totalFlightHours: 500,
      insuranceProvider: "Aviation Insurance Co.",
      insurancePolicyNumber: "POL-123456",
      insuranceExpiry: "2026-06-30",
      balloonRegistration: "N12345",
      balloonCapacity: 4,
      verificationStatus: "pending" as const,
      submittedAt: "2025-01-05",
    },
    {
      id: "2",
      fullName: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 234-5678",
      licenseNumber: "FAA-87654321",
      licenseExpiry: "2027-03-15",
      yearsExperience: 8,
      totalFlightHours: 420,
      insuranceProvider: "Sky Insurance Ltd.",
      insurancePolicyNumber: "POL-789012",
      insuranceExpiry: "2026-09-20",
      balloonRegistration: "N67890",
      balloonCapacity: 6,
      verificationStatus: "pending" as const,
      submittedAt: "2025-01-06",
    },
  ])

  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (pilotId: string) => {
    setProcessingId(pilotId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPilots((prev) => prev.map((p) => (p.id === pilotId ? { ...p, verificationStatus: "approved" as const } : p)))
    setProcessingId(null)
  }

  const handleReject = async (pilotId: string) => {
    setProcessingId(pilotId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPilots((prev) => prev.map((p) => (p.id === pilotId ? { ...p, verificationStatus: "rejected" as const } : p)))
    setProcessingId(null)
  }

  const pendingPilots = pilots.filter((p) => p.verificationStatus === "pending")

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
                  <CardTitle>{pilot.fullName}</CardTitle>
                  <CardDescription>Submitted on {new Date(pilot.submittedAt).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{pilot.email}</p>
                  <p className="text-sm">{pilot.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License</p>
                  <p className="font-medium">{pilot.licenseNumber}</p>
                  <p className="text-sm">Expires: {new Date(pilot.licenseExpiry).toLocaleDateString()}</p>
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
                            {new Date(pilot.licenseExpiry).toLocaleDateString()}
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
                            {new Date(pilot.insuranceExpiry).toLocaleDateString()}
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
