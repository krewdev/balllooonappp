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

  // Log webhook events in development only
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Webhook event type:", event.type)
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (process.env.NODE_ENV !== "production") {
          console.log("[v0] Checkout completed:", session.id)
        }
        const metadata = (session.metadata || {}) as Record<string, string>
        
        // Handle booking payments
        if (metadata.type === "booking" && metadata.bookingId) {
          try {
            await prisma.booking.update({
              where: { id: metadata.bookingId },
              data: { paid: true, status: "confirmed" },
            })
            if (process.env.NODE_ENV !== "production") {
              console.log("[v0] Booking marked paid:", metadata.bookingId)
            }
          } catch (e) {
            console.error("[v0] Failed to update booking on webhook:", metadata.bookingId, e)
          }
        }

        // Handle pilot subscriptions
        if (metadata.type === "pilot" && metadata.userId) {
          try {
            const customerId = session.customer as string | null
            const subscriptionId = session.subscription as string | null
            
            // NOTE: The Pilot model currently doesn't have subscription fields.
            // To enable subscription tracking, add these fields to prisma/schema.prisma:
            // stripeCustomerId String?
            // stripeSubscriptionId String?
            // subscriptionStatus String? // 'active', 'cancelled', 'past_due', etc.
            // subscriptionTier String? // 'basic', 'premium'
            
            // Once schema is updated, uncomment below:
            /*
            await prisma.pilot.update({
              where: { id: metadata.userId },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: 'active',
                subscriptionTier: metadata.tier || null,
                updatedAt: new Date(),
              },
            })
            */
            
            if (process.env.NODE_ENV !== "production") {
              console.log("[v0] Pilot subscription completed:", {
                pilotId: metadata.userId,
                customerId,
                subscriptionId,
                tier: metadata.tier,
              })
            }
          } catch (e) {
            console.error("[v0] Failed to update pilot subscription:", metadata.userId, e)
          }
        }

        // Handle meister payments
        if (metadata.type === "meister" && metadata.userId) {
          try {
            const paymentIntentId = session.payment_intent as string | null
            
            // NOTE: The Meister model currently doesn't have payment tracking fields.
            // To enable payment tracking, add these fields to prisma/schema.prisma:
            // paymentStatus String? // 'paid', 'pending', 'failed'
            // stripePaymentIntentId String?
            // lastPaymentDate DateTime?
            
            // Once schema is updated, uncomment below:
            /*
            await prisma.meister.update({
              where: { id: metadata.userId },
              data: {
                paymentStatus: 'paid',
                stripePaymentIntentId: paymentIntentId,
                lastPaymentDate: new Date(),
                updatedAt: new Date(),
              },
            })
            */
            
            if (process.env.NODE_ENV !== "production") {
              console.log("[v0] Meister payment completed:", {
                meisterId: metadata.userId,
                paymentIntentId,
                tier: metadata.tier,
              })
            }
          } catch (e) {
            console.error("[v0] Failed to update meister payment:", metadata.userId, e)
          }
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        if (process.env.NODE_ENV !== "production") {
          console.log("[v0] Subscription updated:", subscription.id)
        }

        try {
          const customerId = subscription.customer as string
          
          // Find pilot by stripe customer ID
          // NOTE: Requires stripeCustomerId field in Pilot model
          // Once schema is updated, uncomment below:
          /*
          const pilot = await prisma.pilot.findFirst({
            where: { stripeCustomerId: customerId },
          })
          
          if (pilot) {
            await prisma.pilot.update({
              where: { id: pilot.id },
              data: {
                subscriptionStatus: subscription.status, // 'active', 'canceled', 'past_due', etc.
                updatedAt: new Date(),
              },
            })
            
            if (process.env.NODE_ENV !== "production") {
              console.log("[v0] Pilot subscription status updated:", {
                pilotId: pilot.id,
                status: subscription.status,
              })
            }
          }
          */
          
          // Log for now until schema is updated
          if (process.env.NODE_ENV !== "production") {
            console.log("[v0] Subscription update received (schema update needed):", {
              customerId,
              subscriptionId: subscription.id,
              status: subscription.status,
            })
          }
        } catch (e) {
          console.error("[v0] Failed to update subscription status:", subscription.id, e)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        if (process.env.NODE_ENV !== "production") {
          console.log("[v0] Subscription cancelled:", subscription.id)
        }

        try {
          const customerId = subscription.customer as string
          
          // Find pilot by stripe customer ID and mark subscription as cancelled
          // NOTE: Requires stripeCustomerId field in Pilot model
          // Once schema is updated, uncomment below:
          /*
          const pilot = await prisma.pilot.findFirst({
            where: { stripeCustomerId: customerId },
          })
          
          if (pilot) {
            await prisma.pilot.update({
              where: { id: pilot.id },
              data: {
                subscriptionStatus: 'cancelled',
                stripeSubscriptionId: null, // Clear subscription ID
                updatedAt: new Date(),
              },
            })
            
            if (process.env.NODE_ENV !== "production") {
              console.log("[v0] Pilot subscription cancelled:", pilot.id)
            }
            
            // TODO: Send email notification to pilot about cancellation
            // await sendSubscriptionCancelledEmail(pilot.email)
          }
          */
          
          // Log for now until schema is updated
          if (process.env.NODE_ENV !== "production") {
            console.log("[v0] Subscription cancellation received (schema update needed):", {
              customerId,
              subscriptionId: subscription.id,
            })
          }
        } catch (e) {
          console.error("[v0] Failed to cancel subscription:", subscription.id, e)
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        // Always log payment failures (important for production)
        console.error("[v0] Payment failed:", invoice.id)

        try {
          const customerId = invoice.customer as string
          const subscriptionId = invoice.subscription as string | null
          
          // Find pilot by stripe customer ID
          // NOTE: Requires stripeCustomerId field in Pilot model
          // Once schema is updated, uncomment below:
          /*
          const pilot = await prisma.pilot.findFirst({
            where: { stripeCustomerId: customerId },
          })
          
          if (pilot) {
            // Update subscription status to indicate payment issue
            await prisma.pilot.update({
              where: { id: pilot.id },
              data: {
                subscriptionStatus: 'past_due',
                updatedAt: new Date(),
              },
            })
            
            // TODO: Send email/SMS notification to pilot about payment failure
            // await notifyPilotOfPaymentFailure({
            //   email: pilot.email,
            //   phone: pilot.phone,
            //   invoiceUrl: invoice.hosted_invoice_url,
            // })
            
            if (process.env.NODE_ENV !== "production") {
              console.log("[v0] Pilot payment failed:", pilot.id)
            }
          }
          */
          
          // Log for now until schema is updated
          console.error("[v0] Payment failure received (schema update needed):", {
            customerId,
            subscriptionId,
            invoiceId: invoice.id,
            amountDue: invoice.amount_due,
          })
        } catch (e) {
          console.error("[v0] Failed to handle payment failure:", invoice.id, e)
        }

        break
      }

      default:
        if (process.env.NODE_ENV !== "production") {
          console.log("[v0] Unhandled event type:", event.type)
        }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] Webhook handler error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
