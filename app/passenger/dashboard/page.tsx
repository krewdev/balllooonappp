import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MapPin, Settings, Calendar } from "lucide-react"
import Link from "next/link"

export default function PassengerDashboardPage() {
  // Mock data - would come from database
  const passenger = {
    name: "Jane Smith",
    location: "Napa Valley, CA",
    maxDistance: 50,
    emailNotifications: true,
    smsNotifications: true,
  }

  const recentNotifications = [
    {
      id: 1,
      pilotName: "John Doe",
      location: "Napa Valley",
      distance: 5,
      date: "2 hours ago",
      available: true,
    },
    {
      id: 2,
      pilotName: "Sarah Johnson",
      location: "Sonoma",
      distance: 15,
      date: "1 day ago",
      available: false,
    },
    {
      id: 3,
      pilotName: "Mike Wilson",
      location: "St. Helena",
      distance: 12,
      date: "3 days ago",
      available: false,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Passenger Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {passenger.name}</p>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Your Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              {passenger.location}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Search Radius</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{passenger.maxDistance} km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {passenger.emailNotifications && <Badge variant="default">Email</Badge>}
              {passenger.smsNotifications && <Badge variant="default">SMS</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Pilots who have been available near you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-semibold">{notification.pilotName}</p>
                      {notification.available && (
                        <Badge variant="default" className="bg-green-500">
                          Available Now
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.location} • {notification.distance} km away
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.date}</p>
                  </div>
                  <Button variant={notification.available ? "default" : "outline"} disabled={!notification.available}>
                    {notification.available ? "Book Now" : "Unavailable"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your preferences and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/passenger/preferences">
                <MapPin className="mr-2 h-4 w-4" />
                Update Location
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/passenger/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/passenger/settings">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Bookings
            </CardTitle>
            <CardDescription>Your scheduled balloon rides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-2 text-muted-foreground">No upcoming bookings</p>
              <p className="text-sm text-muted-foreground">Book a ride when you receive a notification</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
