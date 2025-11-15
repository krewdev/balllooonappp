import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'
import { cookies } from 'next/headers'

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const cookieStore = await cookies();
    const session = await getSession(cookieStore.get('session')?.value);

    if (!session || session.role !== 'pilot') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pilotId = session.userId
    const passengerId = params.id

    const body = await req.json().catch(() => ({} as any))
    const action = body.action || 'block'

    // Verify that the passenger has at least one booking with this pilot (prevent random blocking)
    const booking = await prisma.booking.findFirst({
      where: {
        passengerId,
        flight: { pilotId }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Passenger has no bookings with this pilot' }, { status: 403 })
    }

    if (action === 'block') {
      await prisma.passenger.update({ where: { id: passengerId }, data: { blocked: true } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'unblock') {
      await prisma.passenger.update({ where: { id: passengerId }, data: { blocked: false } })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('passenger action error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
