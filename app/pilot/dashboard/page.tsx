import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Calendar, Settings, PlusCircle } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import { DownloadQR } from "@/components/pilot/download-qr";
import { StripeOnboarding } from "@/components/pilot/StripeOnboarding";
import { OnboardingTutorialWrapper } from "@/components/pilot/onboarding-tutorial-wrapper";
import { RestartTutorialButton } from "@/components/pilot/restart-tutorial-button";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/sessions";
import { Pilot } from "@prisma/client";
import { stripe } from "@/lib/stripe";

async function getStripeStatus(
  stripeAccountId: string | null
): Promise<{ hasAccount: boolean; onboarded: boolean }> {
  if (!stripeAccountId) {
    return { hasAccount: false, onboarded: false };
  }
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return {
      hasAccount: true,
      onboarded: account.details_submitted && account.charges_enabled,
    };
  } catch (error) {
    // If account is not found or any other error, treat as not having an account
    console.error("Failed to retrieve Stripe account:", error);
    return { hasAccount: false, onboarded: false };
  }
}

export default async function PilotDashboardPage() {
  const session = await getServerSession();

  if (!session || session.role !== "pilot") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You must be logged in as a pilot to view this page.
        </p>
        <Button asChild className="mt-4">
          <Link href="/pilot/login">Pilot Login</Link>
        </Button>
      </div>
    );
  }

  const pilot = await prisma.pilot.findUnique({
    where: { id: session.pilotId },
  });

  if (!pilot) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Pilot Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          Could not find pilot details. Please try logging in again.
        </p>
      </div>
    );
  }

  const totalFlights = await prisma.flight.count({
    where: { pilotId: pilot.id },
  });

  const stripeStatus = await getStripeStatus(pilot.stripeAccountId);
  const canCreateFlights = pilot.approved && stripeStatus.onboarded;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Onboarding Tutorial - shows automatically for newly approved pilots */}
      <OnboardingTutorialWrapper 
        pilot={pilot} 
        stripeOnboarded={stripeStatus.onboarded}
      />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Pilot Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {pilot.fullName || "Pilot"}
            </p>
          </div>
          <div className="flex gap-2">
            {pilot.approved && <RestartTutorialButton pilotId={pilot.id} />}
            <BackButton />
          </div>
        </div>
      </div>

      {/* Status & Onboarding */}
      <div className="mb-8 grid gap-6">
        {!pilot.approved && (
          <Card className="border-amber-500 bg-amber-50">
            <CardHeader>
              <CardTitle>Application Pending</CardTitle>
              <CardDescription>
                Your pilot application is currently under review. We will notify
                you once it has been approved.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {pilot.approved && <StripeOnboarding pilot={pilot} />}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            {!canCreateFlights && (
              <CardDescription>
                Please complete your Stripe onboarding to create and manage
                flights.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              asChild
              className="h-24 flex-col gap-2"
              disabled={!canCreateFlights}
            >
              <Link href="/pilot/flights/new">
                <PlusCircle className="h-6 w-6" />
                <span>New Flight</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-24 flex-col gap-2"
              disabled={!canCreateFlights}
            >
              <Link href="/pilot/flights">
                <Calendar className="h-6 w-6" />
                <span>Manage Flights</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-24 flex-col gap-2">
              <Link href="/pilot/passengers">
                <Settings className="h-6 w-6" />
                <span>Passengers</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-24 flex-col gap-2">
              <Link href="/pilot/transactions">
                <Settings className="h-6 w-6" />
                <span>Transactions</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* At a Glance */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalFlights}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Your Pilot QR Code
              </CardTitle>
              <CardDescription>Share this QR code with passengers to verify your credentials</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4 rounded-lg border-2 border-primary/20 p-4">
                <DownloadQR pilotId={pilot.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
