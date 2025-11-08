import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Passenger } from '@prisma/client'

export default async function PilotPassengersPage() {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  
  if (!session || session.role !== 'pilot') {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You must be logged in as a pilot to view this page.</p>
      </div>
    )
  }

  const bookings = await prisma.booking.findMany({
    where: {
      flight: {
        pilotId: session.userId,
      },
    },
    include: {
      passenger: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Deduplicate passengers
  const passengers: Passenger[] = Array.from(new Map(bookings.map(b => [b.passenger.id, b.passenger])).values())

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Passengers</h1>
        <BackButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Passengers</CardTitle>
        </CardHeader>
        <CardContent>
          {passengers.length === 0 ? (
            <p>No passengers have booked with you yet.</p>
          ) : (
            <div className="space-y-4">
              {passengers.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${p.email}.png`} alt={p.fullName || 'Passenger'} />
                      <AvatarFallback>{p.fullName?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{p.fullName}</p>
                      <p className="text-sm text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.phone}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
