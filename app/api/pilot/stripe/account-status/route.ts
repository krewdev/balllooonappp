import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/sessions'

const DEV_TOKEN = 'dev-token-pilot-123'

export async function GET(req: Request) {
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
    const url = new URL(req.url)
    let accountId = url.searchParams.get('accountId')

    if (!accountId) {
      const pilot = await prisma.pilot.findUnique({ where: { id: pilotId } })
      accountId = pilot?.stripeAccountId || null
    }

    if (!accountId) {
      return new NextResponse(JSON.stringify({ error: 'accountId is required' }), { status: 400 })
    }

    let account: any
    try {
      account = await stripe.accounts.retrieve(accountId)
    } catch (e: any) {
      const msg = e?.message || ''
      const status = e?.statusCode
      const isAccessIssue =
        status === 401 ||
        msg.includes('does not have access to account') ||
        msg.includes('No such account')
      if (isAccessIssue) {
        // The saved accountId is not accessible with the current platform key.
        // Clear it so the client can recreate a new account under the correct platform.
        await prisma.pilot.update({ where: { id: pilotId! }, data: { stripeAccountId: null } })
        return new NextResponse(
          JSON.stringify({ error: 'account_inaccessible', cleared: true, accountId }),
          { status: 404 }
        )
      }
      throw e
    }

    // Return a simplified view of the account
    const result = {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('account-status error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
