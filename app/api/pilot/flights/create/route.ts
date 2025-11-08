import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);

  if (!session || session.role !== "pilot") {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, date, location, priceCents, maxPassengers, description } = body;

    // Create Stripe product, only including description if it's not empty
    const productData: { name: string; description?: string } = { name: title };
    if (description) {
      productData.description = description;
    }
    const product = await stripe.products.create(productData);

    // Create price (one-time) in USD
    const price = await stripe.prices.create({
      unit_amount: priceCents,
      currency: 'usd',
      product: product.id,
    });

    // Create Pay Link
    const payLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        },
      },
    });

    // Persist flight in DB attached to the authenticated pilot
    const flight = await prisma.flight.create({
      data: {
        pilotId: session.userId,
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
    });

    return NextResponse.json({ flight, payLink: payLink.url });
  } catch (err: any) {
    console.error('create flight error', err);
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
}
