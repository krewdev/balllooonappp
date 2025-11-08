import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, weightKg, phone, location } = body;

    if (!fullName || !email || !password || !weightKg || !phone || !location) {
      return NextResponse.json(
        { error: "Full name, email, password, weight, phone, and location are required" },
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

    const passwordHash = await bcrypt.hash(password, 10);

    const passenger = await prisma.passenger.create({
      data: {
        fullName,
        email,
        passwordHash,
        weightKg: parseInt(weightKg, 10),
        phone,
        location,
      },
    });

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
