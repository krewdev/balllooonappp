import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe, PLATFORM_FEE_BPS } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const { bookingId, successUrl, cancelUrl } = (await req.json()) as {
      bookingId?: string
      successUrl?: string
      cancelUrl?: string
    }

    if (!bookingId) {
      return NextResponse.json({ ok: false, error: "bookingId required" }, { status: 400 })
    }

    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      include: { flight: true, passenger: true },
    })

    if (!booking) {
      return NextResponse.json({ ok: false, error: "booking not found" }, { status: 404 })
    }

    const reqUrl = new URL(req.url)
    const origin = reqUrl.origin

    if (booking.paid) {
      // Already paid, point to status page
      const url = successUrl || `${origin}/flight/${booking.flightId}/status`
      return NextResponse.json({ ok: true, alreadyPaid: true, url })
    }

    const success = successUrl || `${origin}/flight/${booking.flightId}/status`
    const cancel = cancelUrl || `${origin}/cancel`

  const name = `Flight: ${booking.flight.title}`
    const description = booking.flight.description || `Location: ${booking.flight.location}`
    const unit_amount = booking.flight.priceCents

    if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
      return NextResponse.json({ ok: false, error: "invalid flight price" }, { status: 400 })
    }

    // Determine pilot's connected account (if onboarded)
    let destinationAccount: string | null = null
    if (booking.flight?.pilotId) {
      const pilot = await (prisma as any).pilot.findUnique({ where: { id: booking.flight.pilotId } })
      destinationAccount = pilot?.stripeAccountId || null
    }

    // Compute platform fee in cents
    const feeAmount = Math.floor((unit_amount * PLATFORM_FEE_BPS) / 10000)

    const base: any = {
      mode: "payment",
      success_url: success,
      cancel_url: cancel,
      metadata: {
        type: "booking",
        bookingId: booking.id,
        flightId: booking.flightId,
        passengerId: booking.passengerId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount,
            product_data: {
              name,
              description,
            },
          },
        },
      ],
      customer_email: booking.passenger?.email || undefined,
    }

    // If pilot has a connected account, create a destination charge with application fee
    if (destinationAccount) {
      base.payment_intent_data = {
        application_fee_amount: feeAmount,
        transfer_data: { destination: destinationAccount },
      }
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create(base)

    return NextResponse.json({ ok: true, url: session.url })
  } catch (err) {
    console.error("start booking payment error", err)
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 })
  }
}
