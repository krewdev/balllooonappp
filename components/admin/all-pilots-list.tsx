"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Ban, CheckCircle } from "lucide-react"
import { Pilot } from "@prisma/client"

export function AllPilotsList() {
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPilots()
  }, [])

  const fetchPilots = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/pilots", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
        },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch pilots: ${res.statusText}`)
      }
      const data = await res.json()
      setPilots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBlock = async (pilotId: string, currentlyBlocked: boolean) => {
    setActionLoading(pilotId)
    try {
      const res = await fetch(`/api/admin/pilots/${pilotId}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      })

      if (!res.ok) {
        throw new Error("Failed to update pilot")
      }

      // Update local state
      setPilots(pilots.map(p =>
        p.id === pilotId ? { ...p, blocked: !currentlyBlocked } : p
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pilot")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border p-12">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading pilots...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive p-12 text-destructive">
        <AlertCircle className="mb-2 h-8 w-8" />
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Pilots</CardTitle>
        <CardDescription>A list of all registered pilots in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Stripe Account</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pilots.map((pilot) => (
              <TableRow key={pilot.id}>
                <TableCell className="font-medium">{pilot.fullName || "N/A"}</TableCell>
                <TableCell>{pilot.email}</TableCell>
                <TableCell>
                  <Badge variant={pilot.approved ? "default" : "destructive"}>
                    {pilot.approved ? "Approved" : "Not Approved"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {pilot.blocked ? (
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
                  <Badge variant={pilot.stripeAccountId ? "secondary" : "outline"}>
                    {pilot.stripeAccountId ? "Onboarded" : "Not Onboarded"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(pilot.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={pilot.blocked ? "default" : "destructive"}
                    onClick={() => toggleBlock(pilot.id, pilot.blocked)}
                    disabled={actionLoading === pilot.id}
                  >
                    {actionLoading === pilot.id ? (
                      "Processing..."
                    ) : pilot.blocked ? (
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
      </CardContent>
    </Card>
  )
}
