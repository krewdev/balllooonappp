import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Calendar, Users, Bell, Settings } from "lucide-react"
import Link from "next/link"
import { BackButton } from "@/components/ui/back-button"
import dynamic from 'next/dynamic'

const StripeOnboarding = dynamic(() => import('@/components/pilot/StripeOnboarding').then((m) => m.StripeOnboarding), { ssr: true })

export default async function PilotDashboardPage() {
  // Fetch pilot data from the development API route
  // This keeps the page a server component and makes it easy to swap in real data later.
  let pilot: any = null

  try {
    const res = await fetch("/api/pilot/me", { cache: "no-store" })
    if (res.ok) {
      pilot = await res.json()
    }
  } catch (err) {
    // swallow - fallback to local mock
    console.error("Failed to load pilot data:", err)
  }

  // Fallback mock if API isn't available
  if (!pilot) {
    pilot = {
      name: "John Doe",
      verificationStatus: "approved",
      subscriptionStatus: "active",
      subscriptionTier: "premium",
      qrCodeUrl: "/qr-code.png",
      totalFlights: 24,
      recentActivity: [
        { id: 1, title: "Flight to Napa Valley", subtitle: "3 passengers notified", time: "2 days ago" },
        { id: 2, title: "Sunset Ride", subtitle: "2 passengers booked", time: "5 days ago" },
      ],
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Pilot Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {pilot.name}</p>
          </div>
          <BackButton />
        </div>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={pilot.verificationStatus === "approved" ? "default" : "secondary"} className="text-sm">
              {pilot.verificationStatus === "approved" ? "✓ Verified" : "Pending Review"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-sm capitalize">
              {pilot.subscriptionTier} Plan
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your Pilot QR Code
            </CardTitle>
            <CardDescription>Share this QR code with passengers to verify your credentials</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4 rounded-lg border-2 border-primary/20 p-4">
              <img
                src={pilot.qrCodeUrl || "/placeholder.svg"}
                alt="Pilot QR Code"
                className="h-48 w-48"
                width={200}
                height={200}
              />
            </div>
            <Button variant="outline">Download QR Code</Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your pilot account and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/pilot/availability">
                <Calendar className="mr-2 h-4 w-4" />
                Set Availability
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/pilot/passengers">
                <Users className="mr-2 h-4 w-4" />
                View Interested Passengers
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/pilot/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/pilot/settings">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
            {/* Stripe onboarding tutorial */}
            <div>
              <StripeOnboarding />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest flights and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">Flight to Napa Valley</p>
                    <p className="text-sm text-muted-foreground">3 passengers notified</p>
                  </div>
                  <Badge variant="secondary">2 days ago</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
