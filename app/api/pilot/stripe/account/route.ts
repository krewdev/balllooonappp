import { NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function GET() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get('session')?.value);

  if (!session || session.role !== 'pilot') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stripe = getStripe()
    const pilot = await prisma.pilot.findUnique({
      where: { id: session.userId },
      select: { stripeAccountId: true }
    });

    if (!pilot || !pilot.stripeAccountId) {
      // The pilot exists in our DB but hasn't started the Stripe process.
      // This is a valid state, not an error.
      return NextResponse.json({ onboarded: false, hasAccount: false });
    }

    try {
      const account = await stripe.accounts.retrieve(pilot.stripeAccountId);

      // An account is considered fully onboarded if charges are enabled.
      const isOnboarded = account.charges_enabled;

      return NextResponse.json({ onboarded: isOnboarded, hasAccount: true });
    } catch (stripeError: any) {
      // If Stripe account doesn't exist or is invalid, treat as no account
      if (stripeError?.code === 'resource_missing' || stripeError?.statusCode === 404) {
        return NextResponse.json({ onboarded: false, hasAccount: false });
      }
      throw stripeError;
    }
  } catch (error: any) {
    console.error('Failed to check Stripe account status:', error);
    // Return a safe response instead of 500 to prevent UI errors
    return NextResponse.json({ 
      onboarded: false, 
      hasAccount: false,
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}
