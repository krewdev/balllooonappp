import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore.get("session")?.value);

    if (!session || session.role !== "pilot") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pilotId = session.userId

    // Passengers directly associated with this pilot (pilotId on passenger)
    const directPassengers = await prisma.passenger.findMany({
      where: { pilotId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        location: true,
        blocked: true,
        createdAt: true,
      },
    })

    // Passengers who have bookings on flights owned by this pilot
    const bookings = await prisma.booking.findMany({
      where: { flight: { pilotId } },
      include: { passenger: true },
      orderBy: { createdAt: 'desc' }
    })

    const map = new Map<string, any>()

    for (const p of directPassengers) {
      map.set(p.id, {
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        location: p.location,
        blocked: p.blocked,
        totalBookings: 0,
        lastBookingAt: null,
      })
    }

    for (const b of bookings) {
      const passenger = b.passenger
      if (!map.has(passenger.id)) {
        map.set(passenger.id, {
          id: passenger.id,
          fullName: passenger.fullName,
          email: passenger.email,
          phone: passenger.phone,
          location: passenger.location,
          blocked: passenger.blocked,
          totalBookings: 0,
          lastBookingAt: null,
        })
      }
      const entry = map.get(passenger.id)
      entry.totalBookings += 1
      if (!entry.lastBookingAt || new Date(b.createdAt) > new Date(entry.lastBookingAt)) {
        entry.lastBookingAt = b.createdAt
      }
    }

    const passengers = Array.from(map.values())

    return NextResponse.json({ passengers })
  } catch (error) {
    console.error("Failed to fetch passengers:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
