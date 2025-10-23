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
    // NOTE: Prisma client types may be out of date until you run `prisma generate`.
    // Use a raw query to avoid type errors in the dev environment.
    const pilots = await prisma.$queryRaw<any>`SELECT id, email, fullName, phone, createdAt FROM Pilot WHERE approved = 0 ORDER BY createdAt ASC`

    return NextResponse.json(pilots || [])
  } catch (err) {
    console.error('Failed to fetch pending pilots', err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
