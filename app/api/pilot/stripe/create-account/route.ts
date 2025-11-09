import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'

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
    // Ensure pilot exists
    const pilot = await prisma.pilot.findUnique({ where: { id: pilotId } })
    if (!pilot) {
      return new NextResponse(JSON.stringify({ error: 'Pilot not found. Please complete pilot registration first.' }), { status: 404 })
    }

    // Create a new Stripe Connect account (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual',
    })

    // Persist to this pilot
    await prisma.pilot.update({
      where: { id: pilotId },
      data: { stripeAccountId: account.id },
    })

    return NextResponse.json({ accountId: account.id })
  } catch (err: any) {
    console.error('create-account error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
