import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id } = params
    const flight = await prisma.flight.findUnique({ 
      where: { id },
      include: {
        Pilot: {
          select: {
            fullName: true,
            phone: true
          }
        }
      }
    })
    if (!flight) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
    
    // Serialize Date objects and ensure pilot data is accessible
    const serializedFlight = {
      ...flight,
      date: flight.date.toISOString(),
      createdAt: flight.createdAt.toISOString(),
      updatedAt: flight.updatedAt.toISOString(),
      // Include both Pilot (from Prisma) and pilot (for compatibility)
      pilot: flight.Pilot,
      Pilot: flight.Pilot,
    }
    
    return NextResponse.json(serializedFlight)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id } = params
    
    // Verify pilot owns this flight
    const cookieStore = await cookies()
    const session = await getSession(cookieStore.get('session')?.value)
    
    if (!session || session.role !== 'pilot') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, date, location, priceCents, maxPassengers, description } = body

    // Verify flight belongs to pilot
    const existingFlight = await prisma.flight.findUnique({
      where: { id, pilotId: session.userId },
    })

    if (!existingFlight) {
      return NextResponse.json({ error: 'Flight not found or access denied' }, { status: 404 })
    }

    // Update flight
    const updatedFlight = await prisma.flight.update({
      where: { id },
      data: {
        title,
        date: new Date(date),
        location,
        priceCents,
        maxPassengers,
        description: description || null,
        updatedAt: new Date(),
      },
      include: {
        Pilot: {
          select: {
            fullName: true,
            phone: true
          }
        }
      }
    })

    // Serialize response
    const serializedFlight = {
      ...updatedFlight,
      date: updatedFlight.date.toISOString(),
      createdAt: updatedFlight.createdAt.toISOString(),
      updatedAt: updatedFlight.updatedAt.toISOString(),
      pilot: updatedFlight.Pilot,
      Pilot: updatedFlight.Pilot,
    }

    return NextResponse.json(serializedFlight)
  } catch (err: any) {
    console.error('Failed to update flight', err)
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 })
  }
}
