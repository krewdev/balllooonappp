"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Flight } from "@prisma/client";

function BookFlightContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const flightId = params.id as string;
  const passengerId = searchParams.get("passengerId");

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flightId) {
      setLoading(true);
      fetch(`/api/flight/${flightId}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to fetch flight details.");
          }
          return res.json();
        })
        .then((data) => {
          setFlight(data);
          setError(null);
        })
        .catch((err: any) => {
          setError(err.message);
          setFlight(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [flightId]);

  const handleBooking = () => {
    if (flight?.stripePayLink) {
      // Append passengerId to the success URL to track who booked
      const successUrl = new URL(flight.stripePayLink);
      const checkoutSessionId = successUrl.pathname.split('/').pop();
      const newSuccessUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id=${checkoutSessionId}&flightId=${flight.id}&passengerId=${passengerId}`;
      
      // The stripePayLink is a redirect itself, so we can't easily modify its success_url.
      // For now, we will just redirect to the pay link.
      // A more robust solution would be to create a checkout session here with the modified success_url.
      window.location.href = flight.stripePayLink;
    } else {
      setError("Booking is not available for this flight.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Flight Not Found</h1>
        <p>The flight you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{flight.title}</CardTitle>
          <CardDescription>
            You have been invited to book a spot on this flight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold">Flight Details</h3>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Date:</strong> {new Date(flight.date).toLocaleString()}
              </p>
              <p>
                <strong>Location:</strong> {flight.location}
              </p>
              <p>
                <strong>Description:</strong> {flight.description || "No description provided."}
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Price per passenger</span>
              <span className="text-2xl font-bold text-primary">
                ${(flight.priceCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
          <Button onClick={handleBooking} className="w-full" size="lg">
            Book Your Spot Now
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Passenger ID: {passengerId || "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookFlightPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <BookFlightContent />
    </Suspense>
  );
}
