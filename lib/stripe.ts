import Stripe from "stripe"

const SECRET = process.env.STRIPE_SECRET_KEY || ""

let stripeInstance: Stripe | null = null

function validateStripeKey() {
  if (!SECRET) {
    const envHint = process.env.NODE_ENV === "production" 
      ? "Check your Vercel environment variables" 
      : "Check your .env.local file";
    throw new Error(`STRIPE_SECRET_KEY is not set. ${envHint}.`)
  }
  if (SECRET.startsWith("pk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY appears to be a publishable key (starts with pk_). Use your secret key (starts with sk_)."
    )
  }
  if (SECRET.includes("your_") || SECRET.includes("YOUR_") || SECRET.endsWith("_here")) {
    throw new Error(
      "STRIPE_SECRET_KEY is set to a placeholder value. Please update with your actual Stripe secret key from https://dashboard.stripe.com/test/apikeys"
    )
  }
  // Warn if using test key in production (but don't block)
  if (process.env.NODE_ENV === "production" && SECRET.startsWith("sk_test_")) {
    console.warn("⚠️  WARNING: Using Stripe TEST key in production. Switch to sk_live_ for production.")
  }
}

export function getStripe() {
  if (stripeInstance) return stripeInstance
  validateStripeKey()
  stripeInstance = new Stripe(SECRET, {
    apiVersion: "2025-09-30.clover",
    typescript: true,
  })
  return stripeInstance
}

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
