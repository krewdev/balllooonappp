import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    // In production, you should set STRIPE_WEBHOOK_SECRET
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // For development, parse the body directly
      event = JSON.parse(body)
    }
  } catch (error: any) {
    console.error("[v0] Webhook signature verification failed:", error.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("[v0] Webhook event type:", event.type)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("[v0] Checkout completed:", session.id)
        const metadata = (session.metadata || {}) as Record<string, string>
        if (metadata.type === "booking" && metadata.bookingId) {
          try {
            await (prisma as any).booking.update({
              where: { id: metadata.bookingId },
              data: { paid: true, status: "confirmed" },
            })
            console.log("[v0] Booking marked paid:", metadata.bookingId)
          } catch (e) {
            console.error("[v0] Failed to update booking on webhook:", metadata.bookingId, e)
          }
        }

        // TODO: For pilots: Update subscription_status, stripe_customer_id, stripe_subscription_id
        // TODO: For meisters: Update payment_status, stripe_payment_intent_id

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("[v0] Subscription updated:", subscription.id)

        // TODO: Update pilot subscription status in database

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("[v0] Subscription cancelled:", subscription.id)

        // TODO: Update pilot subscription_status to 'cancelled' in database

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("[v0] Payment failed:", invoice.id)

        // TODO: Notify pilot of payment failure

        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] Webhook handler error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
