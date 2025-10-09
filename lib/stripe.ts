import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})

// Pilot subscription pricing
export const PILOT_SUBSCRIPTION_PRICES = {
  basic: {
    monthly: 2900, // $29.00
    yearly: 29000, // $290.00 (save ~17%)
  },
  premium: {
    monthly: 4900, // $49.00
    yearly: 49000, // $490.00 (save ~17%)
  },
}

// Meister service pricing
export const MEISTER_SERVICE_PRICES = {
  basic: 49900, // $499.00
  premium: 99900, // $999.00
  vip: 199900, // $1,999.00
}
