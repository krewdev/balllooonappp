"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Ban, CheckCircle, Mail, Phone, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

type Passenger = {
  id: string
  fullName: string | null
  email: string
  phone: string
  location: string
  blocked: boolean
  createdAt: string
  pilot: { fullName: string; email: string } | null
  bookings: { id: string }[]
}

export default function AdminPassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPassengers()
  }, [])

  const fetchPassengers = async () => {
    try {
      const response = await fetch("/api/admin/passengers")
      if (response.ok) {
        const data = await response.json()
        setPassengers(data)
      }
    } catch (error) {
      console.error("Failed to fetch passengers:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBlock = async (passengerId: string, currentlyBlocked: boolean) => {
    setActionLoading(passengerId)
    try {
      const response = await fetch(`/api/admin/passengers/${passengerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      })

      if (response.ok) {
        setPassengers(passengers.map(p =>
          p.id === passengerId ? { ...p, blocked: !currentlyBlocked } : p
        ))
      }
    } catch (error) {
      console.error("Failed to update passenger:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const stats = {
    total: passengers.length,
    active: passengers.filter(p => !p.blocked).length,
    blocked: passengers.filter(p => p.blocked).length,
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading passengers...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold flex items-center gap-3">
          <Users className="h-10 w-10" />
          Passenger Management
        </h1>
        <p className="text-muted-foreground">View and manage all platform passengers</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Passengers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.blocked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Passengers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Passengers</CardTitle>
          <CardDescription>
            Manage passenger accounts and block abusive users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passenger</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Associated Pilot</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passengers.map((passenger) => (
                <TableRow key={passenger.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{passenger.fullName || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {passenger.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {passenger.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {passenger.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    {passenger.pilot ? (
                      <div className="text-sm">
                        <div>{passenger.pilot.fullName}</div>
                        <div className="text-muted-foreground">{passenger.pilot.email}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {passenger.bookings.length} bookings
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {passenger.blocked ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <Ban className="h-3 w-3" />
                        Blocked
                      </Badge>
                    ) : (
                      <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={passenger.blocked ? "default" : "destructive"}
                      onClick={() => toggleBlock(passenger.id, passenger.blocked)}
                      disabled={actionLoading === passenger.id}
                    >
                      {actionLoading === passenger.id ? (
                        "Processing..."
                      ) : passenger.blocked ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="mr-1 h-3 w-3" />
                          Block
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {passengers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No passengers found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
