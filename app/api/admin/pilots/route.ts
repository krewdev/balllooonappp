import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAuthorized(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const adminToken = process.env.ADMIN_TOKEN
  // If ADMIN_TOKEN is set, require it. Otherwise allow in development for convenience.
  if (adminToken) return auth === `Bearer ${adminToken}`
  return process.env.NODE_ENV === 'development'
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pilots = await prisma.pilot.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pilots)
  } catch (err) {
    console.error('Failed to fetch pilots', err)
    return NextResponse.json({ error: 'Failed to fetch pilots' }, { status: 500 })
  }
}
