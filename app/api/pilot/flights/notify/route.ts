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
    const { flightId, passengerIds } = await req.json();

    if (!flightId || !passengerIds || !Array.isArray(passengerIds)) {
      return new NextResponse(
        JSON.stringify({ error: "Missing flightId or passengerIds" }),
        { status: 400 }
      );
    }

    const flight = await prisma.flight.findUnique({
      where: { id: flightId, pilotId: session.userId },
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

    const notificationPromises = passengers
      .filter(p => p.phone) // Ensure passenger has a phone number
      .map(passenger => {
        const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/passenger/book/${flight.id}?passengerId=${passenger.id}`;
        const messageBody = `Hello ${passenger.fullName}! A new flight, "${flight.title}", is available. Book your spot here: ${bookingUrl}`;
        
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
