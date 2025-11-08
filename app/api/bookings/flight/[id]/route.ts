import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id } = params
    // auth: must be pilot and own this flight
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    const session = await getSession(sessionId)
    if (!session || session.role !== 'pilot') {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const flight = await prisma.flight.findUnique({ where: { id } })
    if (!flight) return NextResponse.json({ ok: false, error: 'flight not found' }, { status: 404 })
    if (flight.pilotId !== session.userId) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    const bookings = await (prisma as any).booking.findMany({
      where: { flightId: id },
      orderBy: { createdAt: 'desc' },
      include: { passenger: { select: { id: true, email: true, fullName: true, phone: true } } },
    })

    return NextResponse.json({ ok: true, bookings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}
 
