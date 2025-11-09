import Stripe from "stripe"

const SECRET = process.env.STRIPE_SECRET_KEY || ""

function validateStripeKey() {
  if (!SECRET) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  if (SECRET.startsWith("pk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY appears to be a publishable key (starts with pk_). Use your secret key (starts with sk_)."
    )
  }
  if (SECRET.includes("your_") || SECRET.includes("YOUR_") || SECRET.endsWith("_here")) {
    throw new Error(
      "STRIPE_SECRET_KEY is set to a placeholder value. Please update .env.local with your actual Stripe secret key from https://dashboard.stripe.com/test/apikeys"
    )
  }
}

// Only validate at runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  validateStripeKey()
}

export const stripe = SECRET ? new Stripe(SECRET, {
  apiVersion: "2025-09-30.clover",
  typescript: true,
}) : null as any as Stripe

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

// Platform fee in basis points (1% = 100 bps). Default 10% (1000 bps).
export const PLATFORM_FEE_BPS: number = (() => {
  const raw = process.env.PLATFORM_FEE_BPS
  const n = raw ? Number(raw) : 1000
  if (!Number.isFinite(n) || n < 0) return 1000
  return Math.floor(n)
})()
