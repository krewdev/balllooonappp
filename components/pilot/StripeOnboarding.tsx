"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { Pilot } from "@prisma/client";

type StripeOnboardingProps = {
  pilot: Pilot;
};

type OnboardingStatus = "loading" | "not_started" | "pending" | "complete" | "error";

export function StripeOnboarding({ pilot }: StripeOnboardingProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus>("loading");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        const res = await fetch("/api/pilot/stripe/account", { credentials: 'include' });

        // Defensive parsing like other components
        const contentType = res.headers.get('content-type') || '';
        let data: any;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = { error: text };
          }
        }

        if (!res.ok) {
          throw new Error(data?.error || data?.details || `Failed to fetch Stripe status (status ${res.status})`);
        }

        if (!data.hasAccount) {
          setStatus("not_started");
        } else if (data.onboarded) {
          setStatus("complete");
        } else {
          setStatus("pending");
        }
      } catch (err: any) {
        setError(err.message);
        setStatus("error");
      }
    };

    checkStripeStatus();
  }, [pilot.stripeAccountId]);

  const handleOnboarding = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      // This API route creates the account if it doesn't exist,
      // and then returns an onboarding link.
      const res = await fetch("/api/pilot/stripe/onboarding", {
        method: "POST",
        credentials: 'include'
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { error: text };
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.details || `Failed to start onboarding (status ${res.status})`);
      }

      // Redirect the user to the Stripe onboarding URL
      if (data.url) {
        router.push(data.url);
      } else {
        throw new Error("Onboarding URL not found.");
      }
    } catch (err: any) {
      setError(err.message);
      setIsActionLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking Stripe connection...</span>
          </div>
        );
      case "not_started":
        return (
          <>
            <CardTitle>Connect with Stripe</CardTitle>
            <CardDescription>
              To receive payments for flights, you need to connect your Stripe
              account.
            </CardDescription>
            <CardContent className="pt-6">
              <Button onClick={handleOnboarding} disabled={isActionLoading}>
                {isActionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Connect to Stripe
              </Button>
            </CardContent>
          </>
        );
      case "pending":
        return (
          <>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Onboarding Incomplete
            </CardTitle>
            <CardDescription>
              Your Stripe account setup is not yet complete. Finish the process
              to start accepting payments.
            </CardDescription>
            <CardContent className="pt-6">
              <Button onClick={handleOnboarding} disabled={isActionLoading}>
                {isActionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : <ExternalLink className="mr-2 h-4 w-4" />}
                Continue Onboarding
              </Button>
            </CardContent>
          </>
        );
      case "complete":
        return (
          <>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Stripe Connected
            </CardTitle>
            <CardDescription>
              Your account is fully connected. You are ready to receive payments.
            </CardDescription>
          </>
        );
      case "error":
        return (
          <>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Connection Error
            </CardTitle>
            <CardDescription>
              There was a problem connecting to Stripe.
            </CardDescription>
            <CardContent className="pt-4">
              <p className="text-sm text-red-600">{error}</p>
              <Button onClick={handleOnboarding} variant="secondary" className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </>
        );
    }
  };

  return (
    <Card>
      <CardHeader>{renderContent()}</CardHeader>
    </Card>
  );
}
