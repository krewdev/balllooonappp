import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  if (!session || session.role !== 'pilot') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const pilot = await prisma.pilot.findUnique({ where: { id: session.userId } })
  if (!pilot?.stripeAccountId) {
    return NextResponse.json({ transactions: [] })
  }

  try {
    const stripe = getStripe()
    const charges = await stripe.charges.list({
      limit: 100,
    }, { stripeAccount: pilot.stripeAccountId });

    const transactions = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      description: charge.description || 'N/A',
      status: charge.status,
      created: new Date(charge.created * 1000).toISOString(),
    }))

    return NextResponse.json({ transactions })
  } catch (err: any) {
    console.error('Stripe transaction fetch error:', err)
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch transactions' }), { status: 500 })
  }
}
