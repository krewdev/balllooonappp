"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function SmsConsentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const passengerId = searchParams.get("passengerId");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!passengerId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive">Missing Information</h1>
        <p>Passenger ID is required to proceed.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!agreed) {
      setError("You must agree to the terms to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/passenger/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerId, consent: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update consent.");
      }

      setSuccess("Thank you! You will now receive SMS notifications for new flights.");
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/passenger/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>SMS Notification Consent</CardTitle>
          <CardDescription>
            Please confirm your consent to receive SMS messages for flight notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              To receive notifications about new and upcoming hot air balloon flights, we need your permission to send you
              text messages.
            </p>
            <p>
              By checking the box below, you agree to receive SMS messages from pilots regarding flight availability and
              booking information. Message and data rates may apply. You can opt-out at any time by replying STOP.
            </p>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I agree to receive SMS messages.
            </Label>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {success && <p className="text-sm font-medium text-green-600">{success}</p>}

          <Button onClick={handleSubmit} disabled={loading || !!success} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm Consent"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SmsConsentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center">Loading...</div>}>
      <SmsConsentContent />
    </Suspense>
  );
}
