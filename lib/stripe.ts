import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder"

export const stripe = new Stripe(stripeSecretKey, {
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
