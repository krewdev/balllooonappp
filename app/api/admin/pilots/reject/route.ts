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
    const { id, reason } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Update pilot to mark as rejected (could also delete or set approved: false)
    // Option 1: Set approved to false and add rejection reason (would require schema change)
    // Option 2: Delete the pilot (harsh but simple)
    // Option 3: Keep pilot but mark as rejected (requires new field in schema)
    
    // For now, we'll update approved to false and optionally block
    await prisma.pilot.update({ 
      where: { id }, 
      data: { 
        approved: false,
        blocked: false, // Don't block, just mark as not approved
      } 
    })

    // TODO: Optionally send email notification to the pilot with rejection reason
    // if (reason) {
    //   await sendRejectionEmail(pilot.email, reason)
    // }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to reject pilot', err)
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 })
  }
}

