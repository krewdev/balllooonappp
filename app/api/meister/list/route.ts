import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Use generated client now that Prisma client was generated
    const meisters = await prisma.meister.findMany({ select: { id: true, festivalName: true } })

    const mapped = meisters.map((m) => ({ id: m.id, festival_name: m.festivalName || "Event" }))

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Failed to query meisters', err)
    return NextResponse.json([], { status: 200 })
  }
}
