import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAuthorized(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const adminToken = process.env.ADMIN_TOKEN
  if (adminToken) return auth === `Bearer ${adminToken}`
  return process.env.NODE_ENV === 'development'
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // NOTE: Use raw SQL to avoid TypeScript Prisma client type mismatch before `prisma generate`.
    await prisma.$executeRaw`UPDATE Pilot SET approved = 1 WHERE id = ${id}`

    // Optionally: send email notification to the pilot here (placeholder)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to approve pilot', err)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
