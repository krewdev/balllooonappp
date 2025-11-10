import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/sessions'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.role !== 'passenger') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { pilotId, bookingId, rating, content } = body

    if (!pilotId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure passenger has at least one paid booking with this pilot (bookingId optional)
    const passengerId = session.pilotId // sessions store userId in pilotId field

    const bookingWhere: any = { passengerId, flight: { pilotId } }
    if (bookingId) bookingWhere.id = bookingId

    const paidBooking = await prisma.booking.findFirst({ where: { ...bookingWhere, paid: true } })

    if (!paidBooking) {
      return NextResponse.json({ error: 'You must have completed at least one paid booking with this pilot to leave a review' }, { status: 403 })
    }

    const review = await prisma.review.create({
      data: {
        pilotId,
        passengerId,
        bookingId: paidBooking.id,
        rating: Math.max(1, Math.min(5, Number(rating))),
        content: content || null,
      }
    })
    // Add the review to the pilot's reviews relation (if needed, but Prisma handles this automatically via relations)
    // Example: await prisma.pilot.update({ where: { id: pilotId }, data: { reviews: { connect: { id: review.id } } } })
    // However, if your schema is set up correctly, creating the review with pilotId already links it.
    return NextResponse.json({ ok: true, review })
  } catch (err) {
    console.error('review create error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
