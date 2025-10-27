import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'

type Props = { params: { id: string } }

export default async function FlightDetailPage({ params }: Props) {
  const { id } = params

  const cookieStore: any = cookies()
  const sessionId = cookieStore.get?.('session')?.value
  const session = getSession(sessionId)

  if (!session || session.role !== 'pilot') {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="text-sm text-muted-foreground">You must be signed in as a pilot to view this page.</p>
      </div>
    )
  }

  const flight = await prisma.flight.findUnique({ where: { id } })

  if (!flight) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Flight not found</h2>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{flight.title}</h1>
          <p className="text-sm text-muted-foreground">{new Date(flight.date).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pilot/flights" className="btn btn-outline">Back</Link>
          <a href={`/api/pilot/qr/${flight.pilotId}?format=png`} className="btn">Download QR</a>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Location</h3>
        <p>{flight.location}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Description</h3>
        <p>{flight.description || '—'}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Price</h3>
        <p>{(flight.priceCents / 100).toFixed(2)} USD</p>
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Max passengers</h3>
        <p>{flight.maxPassengers}</p>
      </div>
      {/* Bookings list */}
      {await (async () => {
        const bookings = await (prisma as any).booking.findMany({
          where: { flightId: id },
          include: { passenger: { select: { fullName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        })
        return (
          <div>
            <h3 className="font-medium">Bookings ({bookings.length}/{flight.maxPassengers})</h3>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {bookings.map((b: any) => (
                  <li key={b.id} className="border rounded p-2 text-sm flex items-center justify-between">
                    <span>{b.passenger?.fullName || 'Unnamed'} — {b.passenger?.email}</span>
                    <span className="uppercase text-xs text-muted-foreground">{b.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })()}
    </div>
  )
}
