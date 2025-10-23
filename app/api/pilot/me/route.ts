import { NextResponse } from "next/server"

export async function GET() {
  // Mock pilot data for local development
  const pilot = {
    id: "pilot-123",
    name: "John Doe",
    verificationStatus: "approved",
    subscriptionStatus: "active",
    subscriptionTier: "premium",
    qrCodeUrl: "/qr-code.png",
    totalFlights: 24,
    recentActivity: [
      { id: 1, title: "Flight to Napa Valley", subtitle: "3 passengers notified", time: "2 days ago" },
      { id: 2, title: "Sunset Ride", subtitle: "2 passengers booked", time: "5 days ago" },
    ],
  }

  return NextResponse.json(pilot)
}
