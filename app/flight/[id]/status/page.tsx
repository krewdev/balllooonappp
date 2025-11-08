"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function FlightStatusAccessPage() {
  const params = useParams<{ id: string }>();
  const flightId = params?.id;
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/flight/${flightId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName, phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Unable to verify details");
      } else {
        setData(json);
      }
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!data?.booking?.id) return;
    setIsPaymentLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data.booking.id }),
      });
      const { url, error } = await res.json();
      if (!res.ok) {
        throw new Error(error || 'Failed to start payment process.');
      }
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Access Your Flight</CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="e.g. 555-123-4567"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  "Access Flight"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{data.flight.title}</h2>
                <p className="text-muted-foreground">
                  {new Date(data.flight.date).toLocaleString()}
                </p>
                <p className="text-muted-foreground">{data.flight.location}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="font-medium">
                  Booking Status: {data.booking.status}
                </p>
                <p className="text-muted-foreground">
                  Paid: {data.booking.paid ? "Yes" : "No"}
                </p>
              </div>
              {data.flight.description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {data.flight.description}
                </p>
              )}
              {!data.booking.paid && (
                <div className="pt-4">
                  <Button onClick={handlePayment} disabled={isPaymentLoading}>
                    {isPaymentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </Button>
                  {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
