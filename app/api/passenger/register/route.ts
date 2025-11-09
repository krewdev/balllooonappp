import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { twilioClient } from "@/lib/twilio";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, weightLbs, phone, zipCode, pilotId } = body;

    if (!fullName || !email || !password || !weightLbs || !phone || !zipCode) {
      return NextResponse.json(
        { error: "Full name, email, password, weight, phone, and ZIP code are required" },
        { status: 400 }
      );
    }

    const existingPassenger = await prisma.passenger.findUnique({
      where: { email },
    });

    if (existingPassenger) {
      return NextResponse.json(
        { error: "A passenger with this email already exists" },
        { status: 409 }
      );
    }

    // Convert lbs to kg for storage (1 lb = 0.453592 kg)
    const weightKg = Math.round(parseFloat(weightLbs) * 0.453592);

    const passwordHash = await bcrypt.hash(password, 10);

    const passenger = await prisma.passenger.create({
      data: {
        fullName,
        email,
        passwordHash,
        weightKg,
        phone,
        location: zipCode,
        pilotId: pilotId || null,
      },
    });

    // Send welcome SMS if pilotId is provided
    if (pilotId && twilioClient) {
      try {
        // Get pilot info to personalize the message
        const pilot = await prisma.pilot.findUnique({
          where: { id: pilotId },
          select: { fullName: true }
        });

        if (pilot && pilot.fullName) {
          const passengerFirstName = fullName.split(' ')[0];
          const pilotFirstName = pilot.fullName.split(' ')[0];
          
          const message = `Welcome to FlyingHotAir, ${passengerFirstName}! 🎈\n\nYou've successfully registered with pilot ${pilot.fullName}. You'll receive SMS notifications when ${pilotFirstName} has flights available for booking.\n\nKeep an eye on your phone for exclusive flight opportunities!`;
          
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
          });
        }
      } catch (smsError) {
        // Don't fail registration if SMS fails, just log it
        console.error("Failed to send welcome SMS:", smsError);
      }
    }

    // Exclude password hash from the response
    const { passwordHash: _, ...passengerData } = passenger;

    return NextResponse.json(passengerData, { status: 201 });
  } catch (error) {
    console.error("Passenger registration error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
