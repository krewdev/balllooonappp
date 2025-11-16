import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const flightId = params.id
    const { lastName, phone } = (await req.json()) as { lastName?: string; phone?: string }
    if (!flightId || !lastName || !phone) {
      return NextResponse.json({ ok: false, error: "flightId, lastName, phone required" }, { status: 400 })
    }

    // Normalize inputs
    const last = lastName.trim().toLowerCase()
    const phoneNorm = phone.replace(/\D/g, "")

    // Find matching paid booking by passenger last name + phone
    const booking = await (prisma as any).booking.findFirst({
      where: {
        flightId,
        paid: true,
        Passenger: {
          phone: { contains: phoneNorm },
        },
      },
      include: { Passenger: true, Flight: true },
    })

    if (!booking) {
      return NextResponse.json({ ok: false, error: "No paid booking found for provided details" }, { status: 404 })
    }

    const passengerLast = (booking.Passenger?.fullName || "")
      .split(/\s+/)
      .pop()
      ?.toLowerCase()

    if (!passengerLast || passengerLast !== last) {
      return NextResponse.json({ ok: false, error: "Passenger details do not match" }, { status: 403 })
    }

    return NextResponse.json({
      ok: true,
      flight: {
        id: booking.Flight.id,
        title: booking.Flight.title,
        date: booking.Flight.date,
        location: booking.Flight.location,
        description: booking.Flight.description,
      },
      booking: {
        id: booking.id,
        status: booking.status,
        paid: booking.paid,
      },
      passenger: {
        id: booking.Passenger.id,
        fullName: booking.Passenger.fullName,
      },
    })
  } catch (err) {
    console.error("flight access error", err)
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 })
  }
}
