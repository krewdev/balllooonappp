"use client";

import dynamic from "next/dynamic";

// Dynamically import the NotifyPassengers component with SSR turned off.
// This is necessary because it likely uses browser-specific APIs.
const NotifyPassengers = dynamic(
  () => import("@/components/pilot/notify-passengers"),
  {
    ssr: false,
    loading: () => <p>Loading notification options...</p>,
  }
);

// This client component wrapper allows the dynamic import with ssr:false
// to be used within a Server Component page.
export function NotifyPassengersWrapper({ flightId }: { flightId: string }) {
  return <NotifyPassengers flightId={flightId} />;
}
