import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'
import { getStripe } from '@/lib/stripe'

const DEV_TOKEN = 'dev-token-pilot-123'

export async function POST(req: Request) {
  // Auth: prefer session; fallback to dev token
  let pilotId: string | null = null
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value
  const session = await getSession(sessionId)
  if (session?.role === 'pilot') pilotId = session.userId
  if (!pilotId) {
    const auth = req.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ') && auth.split(' ')[1] === DEV_TOKEN) {
      pilotId = 'pilot-123'
    }
  }
  if (!pilotId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const stripe = getStripe()
    const pilot = await prisma.pilot.findUnique({ where: { id: pilotId } })
    if (!pilot) return new NextResponse(JSON.stringify({ error: 'Pilot not found' }), { status: 404 })

    const accountId = pilot.stripeAccountId
    let deleted = false

    if (accountId) {
      try {
        // Best-effort: delete the Connect account (primarily for test/dev). Ignore failures.
        const del = await stripe.accounts.del(accountId)
        deleted = !!del?.deleted
      } catch (e) {
        // Ignore deletion errors (may be already deleted or inaccessible with current key)
      }
    }

    await prisma.pilot.update({ where: { id: pilotId }, data: { stripeAccountId: null } })

    return NextResponse.json({ cleared: true, deleted, accountId })
  } catch (err: any) {
    console.error('reset-account error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
