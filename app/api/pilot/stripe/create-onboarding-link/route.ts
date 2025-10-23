import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const DEV_TOKEN = 'dev-token-pilot-123'

export async function POST(req: Request) {
  // Simple dev-only auth check
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== DEV_TOKEN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await req.json()
    let { accountId, refresh_url, return_url } = body

    // If accountId not provided, try to load from dev pilot
    if (!accountId) {
      const pilot = await prisma.pilot.findUnique({ where: { id: 'pilot-123' } })
      accountId = pilot?.stripeAccountId || null
    }

    if (!accountId) {
      return new NextResponse(JSON.stringify({ error: 'accountId is required' }), { status: 400 })
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refresh_url || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/pilot/dashboard`,
      return_url: return_url || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/pilot/dashboard`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: link.url })
  } catch (err: any) {
    console.error('create-onboarding-link error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
