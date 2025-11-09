import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    const session = await getSession(sessionId);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const passengers = await prisma.passenger.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pilot: {
          select: { fullName: true, email: true },
        },
        bookings: {
          select: { id: true },
        },
      },
    });

    return NextResponse.json(passengers);
  } catch (error) {
    console.error("Failed to fetch passengers:", error);
    return NextResponse.json(
      { error: "Failed to fetch passengers" },
      { status: 500 }
    );
  }
}
