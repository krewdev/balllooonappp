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

    const account = await stripe.accounts.retrieve(pilot.stripeAccountId);

    // An account is considered fully onboarded if charges are enabled.
    const isOnboarded = account.charges_enabled;

    return NextResponse.json({ onboarded: isOnboarded, hasAccount: true });
  } catch (error) {
    console.error('Failed to check Stripe account status:', error);
    return NextResponse.json({ error: 'Failed to retrieve account status' }, { status: 500 });
  }
}
