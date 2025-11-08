import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { passengerId, consent } = await req.json();

    if (!passengerId || typeof consent !== "boolean") {
      return new NextResponse(
        JSON.stringify({ error: "Missing passengerId or consent status" }),
        { status: 400 }
      );
    }

    const passenger = await prisma.passenger.update({
      where: { id: passengerId },
      data: { smsConsent: consent },
    });

    return NextResponse.json({
      message: "Consent updated successfully.",
      passengerId: passenger.id,
      smsConsent: passenger.smsConsent,
    });
  } catch (err: any) {
    console.error("Update consent error", err);
    // Handle cases where the passengerId might not exist
    if (err.code === 'P2025') {
      return new NextResponse(
        JSON.stringify({ error: "Passenger not found." }),
        { status: 404 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500 }
    );
  }
}
