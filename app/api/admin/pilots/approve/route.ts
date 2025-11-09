import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/sessions'

async function isAuthorized(req: Request) {
  // Check for Bearer token first
  const auth = req.headers.get('authorization') || ''
  const adminToken = process.env.ADMIN_TOKEN
  if (adminToken && auth === `Bearer ${adminToken}`) {
    return true
  }
  
  // Check for admin session cookie
  const session = await getServerSession()
  if (session && session.role === 'admin') {
    return true
  }
  
  // Allow in development mode
  return process.env.NODE_ENV === 'development'
}

export async function POST(request: Request) {
  const authorized = await isAuthorized(request)
  
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Use typed Prisma client to update approval status
  await (prisma as any).pilot.update({ where: { id }, data: { approved: true } })

    // Optionally: send email notification to the pilot here (placeholder)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to approve pilot', err)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
