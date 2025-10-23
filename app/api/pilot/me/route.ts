import { NextResponse } from "next/server"
import { getSession } from '@/lib/sessions'
import { prisma } from '@/lib/prisma'

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, decodeURIComponent(v.join('='))]
    })
  )
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || null
    const cookies = parseCookies(cookieHeader)
    const sessionId = cookies['session']
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Load pilot by session.userId
    const pilot = await prisma.pilot.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        stripeAccountId: true,
        createdAt: true,
      },
    })

    if (!pilot) return NextResponse.json({ error: 'Pilot not found' }, { status: 404 })

    // Construct response data expected by dashboard
    const payload = {
      id: pilot.id,
      name: pilot.fullName || pilot.email,
      verificationStatus: (pilot as any).approved ? 'approved' : 'pending',
      subscriptionStatus: pilot.stripeAccountId ? 'active' : 'none',
      subscriptionTier: 'basic',
      qrCodeUrl: `/api/pilot/qr/${pilot.id}`,
      totalFlights: 0,
      recentActivity: [],
    }

    return NextResponse.json(payload)
  } catch (err) {
    console.error('Failed to get pilot', err)
    return NextResponse.json({ error: 'Internal' }, { status: 500 })
  }
}
