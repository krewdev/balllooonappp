import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      email,
      password,
      fullName,
      phone,
      weightKg,
      location,
      maxDistance,
      emailNotifications,
      smsNotifications,
      selectedHost,
    } = body

    // Create passenger and link to pilot or meister if provided
    const data: any = {
      email,
      passwordHash: password || null,
      fullName: fullName || null,
      phone: phone || null,
      weightKg: weightKg ? parseInt(String(weightKg), 10) : null,
      location: location || null,
      maxDistance: maxDistance ? parseInt(String(maxDistance), 10) : null,
      emailNotifications: !!emailNotifications,
      smsNotifications: !!smsNotifications,
    }

    if (selectedHost && String(selectedHost).startsWith('pilot:')) {
      data.pilotId = String(selectedHost).split(':')[1]
    } else if (selectedHost && String(selectedHost).startsWith('event:')) {
      data.meisterId = String(selectedHost).split(':')[1]
    }

    const passenger = await prisma.passenger.create({ data })

    return NextResponse.json({ ok: true, passengerId: passenger.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
