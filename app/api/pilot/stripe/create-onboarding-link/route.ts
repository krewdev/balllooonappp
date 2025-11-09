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
    const body = await req.json()
    let { accountId, refresh_url, return_url } = body
  // Always prefer the actual request origin to avoid localhost port mismatches in dev
  const reqUrl = new URL(req.url)
  const origin = reqUrl.origin

    // If accountId not provided, try to load from this pilot
    if (!accountId) {
      const pilot = await prisma.pilot.findUnique({ where: { id: pilotId } })
      accountId = pilot?.stripeAccountId || null
    }

    // If still no account, create one now for convenience
    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express', business_type: 'individual' })
      await prisma.pilot.update({ where: { id: pilotId }, data: { stripeAccountId: account.id } })
      accountId = account.id
    }

    let link
    try {
      link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refresh_url || `${origin}/pilot/dashboard`,
        return_url: return_url || `${origin}/pilot/dashboard`,
        type: 'account_onboarding',
      })
    } catch (e: any) {
      const msg = e?.message || ''
      const status = e?.statusCode
      const isAccessIssue = status === 401 || msg.includes('does not have access to account') || msg.includes('No such account')
      if (isAccessIssue) {
        // Create a fresh account under this platform and retry once
        const account = await stripe.accounts.create({ type: 'express', business_type: 'individual' })
        await prisma.pilot.update({ where: { id: pilotId }, data: { stripeAccountId: account.id } })
        accountId = account.id
        link = await stripe.accountLinks.create({
          account: accountId,
          refresh_url: refresh_url || `${origin}/pilot/dashboard`,
          return_url: return_url || `${origin}/pilot/dashboard`,
          type: 'account_onboarding',
        })
      } else {
        throw e
      }
    }

    return NextResponse.json({ url: link.url })
  } catch (err: any) {
    console.error('create-onboarding-link error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
