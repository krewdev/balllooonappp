import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/sessions";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
    // The URL the user will be redirected to after the onboarding is complete.
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pilot/dashboard?stripe_return=true`;
    // The URL the user will be redirected to if they fail or cancel the onboarding.
    const refreshUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pilot/dashboard?stripe_refresh=true`;

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
    return NextResponse.json(
      { error: "Failed to create Stripe onboarding link.", details: errorMessage },
      { status: 500 }
    );
  }
}
