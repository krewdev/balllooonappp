import { cookies } from 'next/headers'
import Link from 'next/link'
import React from 'react'
import { getSession } from '@/lib/sessions'
import { prisma } from '@/lib/prisma'

export default async function PilotFlightsPage() {
  // `cookies()` typing in this workspace can be strict; coerce to any to access .get()
  const cookieStore: any = cookies()
  const sessionId = cookieStore.get?.('session')?.value
  const session = getSession(sessionId)

  if (!session || session.role !== 'pilot') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="text-sm text-muted-foreground">You must be signed in as a pilot to view flights.</p>
      </div>
    )
  }

  const flights = await prisma.flight.findMany({
    where: { pilotId: session.userId },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Flights</h1>
        <Link href="/pilot/flights/new" className="btn">New Flight</Link>
      </div>

      {flights.length === 0 ? (
        <p>No flights scheduled yet.</p>
      ) : (
        <ul className="space-y-3">
          {flights.map((f) => (
            <li key={f.id} className="p-4 border rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(f.date).toLocaleString()} • {f.location}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/pilot/flights/${f.id}`} className="btn btn-sm">View</Link>
                  <Link href={`/pilot/flights/${f.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
