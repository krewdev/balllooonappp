import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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
    const existingCount = await prisma.booking.count({
      where: { 
        flightId,
        status: { not: 'canceled' },
      },
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
        id: crypto.randomUUID(),
        email,
        fullName: fullName || null,
        phone: phone || 'no-phone',
        location: '',
        pilotId: flight.pilotId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Prevent duplicate booking for same flight/passenger
    const dup = await prisma.booking.findFirst({ 
      where: { 
        flightId, 
        passengerId: passenger.id, 
        status: { not: 'canceled' },
      },
    })
    if (dup) {
      return NextResponse.json({ ok: true, bookingId: dup.id, duplicate: true })
    }

    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        flightId,
        passengerId: passenger.id,
        status: 'pending',
        paid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true, bookingId: booking.id })
  } catch (err) {
    console.error('create booking error', err)
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}
