import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'
import { NotifyPassengersWrapper } from '@/components/pilot/notify-passengers-wrapper'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = { params: Promise<{ id: string }> }

export default async function FlightDetailPage({ params }: Props) {
  const { id } = await params

  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value
  const session = await getSession(sessionId)

  if (!session || session.role !== 'pilot') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be signed in as a pilot to view this page.</p>
            <Button asChild className="mt-4">
              <Link href="/pilot/login">Pilot Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const flight = await prisma.flight.findUnique({
    where: { id, pilotId: session.userId },
    include: {
      bookings: {
        include: {
          passenger: {
            select: { fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!flight) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Flight Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested flight could not be found or does not belong to you.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/pilot/flights">Back to Flights</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{flight.title}</h1>
          <p className="text-lg text-muted-foreground">{new Date(flight.date).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/pilot/flights">Back to Flights</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flight Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-muted-foreground">Location</h3>
                <p>{flight.location}</p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground">Description</h3>
                <p>{flight.description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Price</h3>
                  <p className="text-xl font-semibold">${(flight.priceCents / 100).toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Capacity</h3>
                  <p className="text-xl font-semibold">{flight.bookings.length} / {flight.maxPassengers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notify Your Registered Passengers</CardTitle>
              <CardDescription>
                Send SMS notifications to passengers who have registered under you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotifyPassengersWrapper flightId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                {flight.bookings.length} of {flight.maxPassengers} seats booked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flight.bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No bookings yet.</p>
              ) : (
                <ul className="space-y-3">
                  {flight.bookings.map((booking) => (
                    <li key={booking.id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{booking.passenger?.fullName || 'Unnamed Passenger'}</p>
                        <p className="text-muted-foreground">{booking.passenger?.email}</p>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
