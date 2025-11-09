import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { twilioClient } from "@/lib/twilio";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("session")?.value);

  if (!session || session.role !== "pilot") {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return new NextResponse(JSON.stringify({ error: "Twilio phone number is not configured." }), {
      status: 500,
    });
  }

  try {
    const { flightId, passengerIds, customMessage } = await req.json();

    if (!flightId || !passengerIds || !Array.isArray(passengerIds)) {
      return new NextResponse(
        JSON.stringify({ error: "Missing flightId or passengerIds" }),
        { status: 400 }
      );
    }

    const flight = await prisma.flight.findUnique({
      where: { id: flightId, pilotId: session.userId },
      include: { pilot: true }
    });

    if (!flight) {
      return new NextResponse(JSON.stringify({ error: "Flight not found" }), {
        status: 404,
      });
    }

    const passengers = await prisma.passenger.findMany({
      where: {
        id: { in: passengerIds },
      },
    });

    // Build the notification message template
    const pilotName = flight.pilot.fullName || "Your pilot"
    const flightDate = new Date(flight.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
    const price = (flight.priceCents / 100).toFixed(2)

    const notificationPromises = passengers
      .filter(p => p.phone) // Ensure passenger has a phone number
      .map(passenger => {
        let messageBody = `Hello ${passenger.fullName}! 🎈\n\n${pilotName} has a hot air balloon flight available!\n\n📍 ${flight.title}\n📅 ${flightDate}\n🗺️ ${flight.location}\n💰 $${price}`
        
        // Add custom message if provided
        if (customMessage && customMessage.trim()) {
          messageBody += `\n\n${customMessage.trim()}`
        }
        
        // Add payment link
        messageBody += `\n\n🎟️ Reserve your spot: ${flight.stripePayLink}`
        
        return twilioClient.messages.create({
          body: messageBody,
          from: fromNumber,
          to: passenger.phone!, // Use the passenger's phone number
        });
      });

    const results = await Promise.allSettled(notificationPromises);
    
    let successfulNotifications = 0;
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log(`Message sent successfully: SID ${result.value.sid}`);
        successfulNotifications++;
      } else {
        console.error(`Failed to send message: ${result.reason}`);
      }
    });

    return NextResponse.json({
      message: `Successfully sent notifications to ${successfulNotifications} of ${passengers.length} selected passenger(s).`,
    });
  } catch (err: any) {
    console.error("Notify passengers error", err);
    return new NextResponse(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500 }
    );
  }
}
