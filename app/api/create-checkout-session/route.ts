import { type NextRequest, NextResponse } from "next/server"
import { getStripe, PILOT_SUBSCRIPTION_PRICES, MEISTER_SERVICE_PRICES } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, tier, billingPeriod, userId, email } = body

    const sessionConfig: any = {
      payment_method_types: ["card"],
      mode: type === "pilot" ? "subscription" : "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      customer_email: email,
      metadata: {
        userId,
        type,
        tier,
      },
    }

    if (type === "pilot") {
      // Pilot subscription
      const price =
        billingPeriod === "yearly"
          ? PILOT_SUBSCRIPTION_PRICES[tier as keyof typeof PILOT_SUBSCRIPTION_PRICES].yearly
          : PILOT_SUBSCRIPTION_PRICES[tier as keyof typeof PILOT_SUBSCRIPTION_PRICES].monthly

      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AeroConnect ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} pilot subscription - ${billingPeriod}`,
            },
            unit_amount: price,
            recurring: {
              interval: billingPeriod === "yearly" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ]
    } else if (type === "meister") {
      // Meister one-time payment
      const price = MEISTER_SERVICE_PRICES[tier as keyof typeof MEISTER_SERVICE_PRICES]

      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Festival Meister ${tier.toUpperCase()} Package`,
              description: `${tier.toUpperCase()} tier festival coordination services`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ]
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("[v0] Stripe checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
