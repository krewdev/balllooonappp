import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const DEV_TOKEN = 'dev-token-pilot-123'

export async function GET(req: Request) {
  // auth check
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== DEV_TOKEN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const url = new URL(req.url)
    let accountId = url.searchParams.get('accountId')

    if (!accountId) {
      const pilot = await prisma.pilot.findUnique({ where: { id: 'pilot-123' } })
      accountId = pilot?.stripeAccountId || null
    }

    if (!accountId) {
      return new NextResponse(JSON.stringify({ error: 'accountId is required' }), { status: 400 })
    }

    const account = await stripe.accounts.retrieve(accountId)

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
