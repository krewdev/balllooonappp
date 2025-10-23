import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const DEV_TOKEN = 'dev-token-pilot-123'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== DEV_TOKEN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, date, location, priceCents, maxPassengers, description } = body

    // Create Stripe product
    const product = await stripe.products.create({ name: title, description: description || '' })

    // Create price (one-time) in USD
    const price = await stripe.prices.create({
      unit_amount: priceCents,
      currency: 'usd',
      product: product.id,
    })

    // Create Pay Link
    const payLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
    })

    // Persist flight in DB attached to dev pilot
    const flight = await prisma.flight.create({
      data: {
        pilotId: 'pilot-123',
        title,
        description,
        date: new Date(date),
        location,
        priceCents: priceCents || 0,
        maxPassengers: maxPassengers || 1,
        stripeProductId: product.id,
        stripePriceId: price.id,
        stripePayLink: payLink.url,
      },
    })

    return NextResponse.json({ flight, payLink: payLink.url })
  } catch (err: any) {
    console.error('create flight error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
