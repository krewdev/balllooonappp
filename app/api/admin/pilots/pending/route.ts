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

export async function GET(request: Request) {
  const authorized = await isAuthorized(request)
  
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pilots = await prisma.pilot.findMany({
      where: { approved: false },
      orderBy: { createdAt: 'asc' },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        phone: true, 
        createdAt: true,
        licenseNumber: true,
        licenseExpiry: true,
        yearsExperience: true,
        totalFlightHours: true,
        insuranceProvider: true,
        insurancePolicyNumber: true,
        insuranceExpiry: true,
        balloonRegistration: true,
        balloonCapacity: true,
      },
    })

    return NextResponse.json(pilots)
  } catch (err) {
    console.error('Failed to fetch pending pilots', err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
