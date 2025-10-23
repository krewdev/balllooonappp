import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const DEV_TOKEN = 'dev-token-pilot-123'

export async function POST(req: Request) {
  // Simple dev-only auth check; expects Authorization: Bearer <token>
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== DEV_TOKEN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  try {
    // Create a new Stripe Connect account (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual',
    })

    // Persist to a pilot record for the dev pilot id
    // NOTE: In real app, associate with authenticated user's id
    await prisma.pilot.upsert({
      where: { id: 'pilot-123' },
      update: { stripeAccountId: account.id },
      create: { id: 'pilot-123', email: 'pilot@example.com', stripeAccountId: account.id },
    })

    return NextResponse.json({ accountId: account.id })
  } catch (err: any) {
    console.error('create-account error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
