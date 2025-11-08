import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type CreateBookingBody = {
  flightId: string
  email: string
  fullName?: string
  phone?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateBookingBody>
    const flightId = String(body.flightId || '')
    const email = String(body.email || '').toLowerCase().trim()
    const fullName = (body.fullName || '').toString()
    const phone = (body.phone || '').toString()

    if (!flightId || !email) {
      return NextResponse.json({ ok: false, error: 'flightId and email are required' }, { status: 400 })
    }

    const flight = await prisma.flight.findUnique({ where: { id: flightId } })
    if (!flight) {
      return NextResponse.json({ ok: false, error: 'flight not found' }, { status: 404 })
    }

    // Capacity check (count non-canceled bookings)
  const existingCount = await (prisma as any).booking.count({
      where: { flightId, NOT: { status: 'canceled' } },
    })
    if (existingCount >= flight.maxPassengers) {
      return NextResponse.json({ ok: false, error: 'flight full' }, { status: 409 })
    }

    // Upsert passenger by email
    const passenger = await prisma.passenger.upsert({
      where: { email },
      update: {
        fullName: fullName || undefined,
        phone: phone || 'no-phone',
        // link passenger to pilot for future notifications
        pilotId: flight.pilotId,
      },
      create: {
        email,
        fullName: fullName || null,
        phone: phone || 'no-phone',
        location: '',
        pilotId: flight.pilotId,
      },
    })

    // Prevent duplicate booking for same flight/passenger
  const dup = await (prisma as any).booking.findFirst({ where: { flightId, passengerId: passenger.id, NOT: { status: 'canceled' } } })
    if (dup) {
      return NextResponse.json({ ok: true, bookingId: dup.id, duplicate: true })
    }

  const booking = await (prisma as any).booking.create({
      data: {
        flightId,
        passengerId: passenger.id,
        status: 'pending',
        paid: false,
      },
    })

    return NextResponse.json({ ok: true, bookingId: booking.id })
  } catch (err) {
    console.error('create booking error', err)
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}
