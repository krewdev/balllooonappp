import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Settings, FileText } from "lucide-react"
import Link from "next/link"

export default function MeisterDashboardPage() {
  // Mock data - would come from database
  const meister = {
    organizationName: "Festival Productions Inc.",
    contactName: "John Smith",
    festivalName: "Annual Hot Air Balloon Festival",
    festivalLocation: "Albuquerque, NM",
    festivalDate: "2025-10-15",
    serviceTier: "premium" as const,
    paymentStatus: "paid" as const,
  }

  const matchedPilots = [
    { id: 1, name: "John Doe", experience: 10, capacity: 4, status: "confirmed" },
    { id: 2, name: "Sarah Johnson", experience: 8, capacity: 6, status: "confirmed" },
    { id: 3, name: "Mike Wilson", experience: 12, capacity: 4, status: "pending" },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Festival Meister Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {meister.contactName}</p>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Service Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-sm capitalize">
              {meister.serviceTier}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500 text-sm">
              ✓ Paid
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Matched Pilots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{matchedPilots.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Days Until Festival</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">45</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Festival Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Festival Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Festival Name</p>
              <p className="font-semibold">{meister.festivalName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4" />
                {meister.festivalLocation}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{new Date(meister.festivalDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="font-semibold">{meister.organizationName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions (hidden until features are available) */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your festival coordination</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon — pilot rosters, scheduling, document management, and account settings.
            </p>
          </CardContent>
        </Card>

        {/* Matched Pilots */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Matched Pilots
            </CardTitle>
            <CardDescription>Pilots assigned to your festival</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchedPilots.map((pilot) => (
                <div key={pilot.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold">{pilot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pilot.experience} years experience • Capacity: {pilot.capacity} passengers
                    </p>
                  </div>
                  <Badge variant={pilot.status === "confirmed" ? "default" : "secondary"} className="capitalize">
                    {pilot.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
