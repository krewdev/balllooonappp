import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const { id } = params
    const flight = await prisma.flight.findUnique({ where: { id } })
    if (!flight) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
    return NextResponse.json(flight)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}
