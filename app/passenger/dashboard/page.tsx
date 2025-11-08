import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { getSession } from "@/lib/sessions"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, User, Bell } from "lucide-react"

export default async function PassengerDashboardPage() {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get("session")?.value)

  if (!session || session.role !== "passenger") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">You must be logged in as a passenger to view this page.</p>
        <Button asChild className="mt-4">
          <Link href="/passenger/login">Passenger Login</Link>
        </Button>
      </div>
    )
  }

  const passenger = await prisma.passenger.findUnique({
    where: { id: session.userId },
    include: {
      bookings: {
        where: { status: "confirmed" },
        include: {
          flight: {
            include: {
              pilot: true,
            },
          },
        },
        orderBy: {
          flight: {
            date: "asc",
          },
        },
      },
    },
  })

  if (!passenger) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Passenger Not Found</h1>
        <p className="mt-2 text-muted-foreground">Could not find your details. Please try logging in again.</p>
      </div>
    )
  }

  const hasBookings = passenger.bookings.length > 0

  if (!hasBookings) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {passenger.fullName}!</CardTitle>
              <CardDescription>Your adventure awaits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-semibold">No Flights Booked Yet</h3>
              <p className="text-muted-foreground">
                Your dashboard will become active once you book your first flight. Keep an eye out for notifications
                from pilots for available flights!
              </p>
              <Button asChild variant="outline">
                <Link href="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Passenger Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {passenger.fullName}!</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
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
            {passenger.bookings.length > 0 ? (
              <ul className="space-y-4">
                {passenger.bookings.map((booking) => (
                  <li key={booking.id} className="rounded-lg border p-4">
                    <h4 className="font-semibold">{booking.flight.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      with {booking.flight.pilot.fullName}
                    </p>
                    <p className="text-sm">
                      {new Date(booking.flight.date).toLocaleString()}
                    </p>
                    <p className="text-sm">Location: {booking.flight.location}</p>
                    <Button asChild size="sm" className="mt-2">
                      <Link href={`/flight/${booking.flight.id}/status`}>View Flight Status</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="mb-2 text-muted-foreground">No upcoming bookings</p>
                <p className="text-sm text-muted-foreground">Book a ride when you receive a notification</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="font-semibold">Full Name</h4>
              <p>{passenger.fullName}</p>
            </div>
            <div>
              <h4 className="font-semibold">Email</h4>
              <p>{passenger.email}</p>
            </div>
            <div>
              <h4 className="font-semibold">Weight</h4>
              <p>{passenger.weightKg} kg</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
