import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/sessions";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe()
    const pilot = await prisma.pilot.findUnique({
      where: { id: session.pilotId },
    });

    if (!pilot) {
      return NextResponse.json({ error: "Pilot not found" }, { status: 404 });
    }

    let accountId = pilot.stripeAccountId;

    // 1. Create a Stripe account if it doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: pilot.email,
        business_type: "individual",
        individual: {
          email: pilot.email,
        },
        metadata: {
          pilotId: pilot.id,
        },
      });
      accountId = account.id;

      await prisma.pilot.update({
        where: { id: pilot.id },
        data: { stripeAccountId: accountId },
      });
    }

    // 2. Create an account link for onboarding
    // Use NEXT_PUBLIC_BASE_URL if set, otherwise fall back to request origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    
    // The URL the user will be redirected to after the onboarding is complete.
    const returnUrl = `${baseUrl}/pilot/dashboard?stripe_return=true`;
    // The URL the user will be redirected to if they fail or cancel the onboarding.
    const refreshUrl = `${baseUrl}/pilot/dashboard?stripe_refresh=true`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    // 3. Return the URL to the frontend
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe onboarding error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    
    // Provide more detailed error information in development
    const errorDetails: any = {
      error: "Failed to create Stripe onboarding link.",
      details: errorMessage,
    };
    
    // Add helpful diagnostics in development
    if (process.env.NODE_ENV !== "production") {
      errorDetails.diagnostics = {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "not set (using request origin)",
        requestOrigin: new URL(req.url).origin,
      };
    }
    
    // Check for common issues
    if (errorMessage.includes("No such account") || errorMessage.includes("does not have access")) {
      errorDetails.hint = "Stripe account access issue. The account may have been created with different API keys.";
    } else if (errorMessage.includes("Invalid API Key")) {
      errorDetails.hint = "Check that STRIPE_SECRET_KEY is set correctly in production environment variables.";
    }
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
