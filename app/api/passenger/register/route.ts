import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { twilioClient } from "@/lib/twilio";
import crypto from "crypto";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { validateEmail, validatePhone, validateZipCode, sanitizeString, validatePassword } from "@/lib/validation";

export async function POST(request: Request) {
  // Rate limiting
  const rateLimit = checkRateLimit(request, rateLimitConfigs.registration);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: "Too many registration attempts. Please try again later.",
        retryAfter: rateLimit.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter || 3600),
        }
      }
    );
  }

  try {
    const body = await request.json();
    const { fullName, email, password, weightLbs, phone, zipCode, pilotId } = body;

    if (!fullName || !email || !password || !weightLbs || !phone || !zipCode) {
      return NextResponse.json(
        { error: "Full name, email, password, weight, phone, and ZIP code are required" },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    const validatedEmail = validateEmail(email);
    if (!validatedEmail) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const validatedPhone = validatePhone(phone);
    if (!validatedPhone) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const validatedZipCode = validateZipCode(zipCode);
    if (!validatedZipCode) {
      return NextResponse.json({ error: "Invalid ZIP code format" }, { status: 400 });
    }

    const sanitizedFullName = sanitizeString(fullName);

    // Validate password complexity
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: "Password does not meet requirements",
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    const existingPassenger = await prisma.passenger.findUnique({
      where: { email: validatedEmail },
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
        id: crypto.randomUUID(),
        fullName: sanitizedFullName,
        email: validatedEmail,
        passwordHash,
        weightKg,
        phone: validatedPhone,
        location: validatedZipCode,
        pilotId: pilotId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
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
          
          const message = `Welcome to FlyingHotAir, ${passengerFirstName}!\n\nYou've successfully registered with pilot ${pilot.fullName}. You'll receive SMS notifications when ${pilotFirstName} has flights available for booking.\n\nKeep an eye on your phone for exclusive flight opportunities!`;
          
          const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
          if (fromNumber) {
            await twilioClient.messages.create({
              body: message,
              from: fromNumber,
              to: phone,
            });
          }
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
