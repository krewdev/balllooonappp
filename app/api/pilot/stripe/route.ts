import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  if (!session || session.role !== 'pilot') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const pilot = await prisma.pilot.findUnique({
      where: { id: session.userId },
    })

    if (!pilot) {
      return new NextResponse(JSON.stringify({ error: 'Pilot not found' }), { status: 404 })
    }

    let accountId = pilot.stripeAccountId
    let accountLink

    // Create a new Stripe account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: pilot.email!,
        country: 'US', // Or determine dynamically
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id

      // Save the new account ID to the pilot's record
      await prisma.pilot.update({
        where: { id: pilot.id },
        data: { stripeAccountId: accountId },
      })
    }

    // Create an account link for onboarding
    const returnUrl = new URL('/pilot/dashboard', req.url).toString()
    const refreshUrl = new URL('/pilot/subscription', req.url).toString() // Re-visit this page on failure

    accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: any) {
    console.error('Stripe onboarding error:', err)
    return new NextResponse(JSON.stringify({ error: 'Failed to create Stripe onboarding link' }), { status: 500 })
  }
}
