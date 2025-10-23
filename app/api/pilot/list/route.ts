import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const pilots = await prisma.pilot.findMany({ select: { id: true, fullName: true } })

  // map to {id, name}
  const mapped = pilots.map((p) => ({ id: p.id, name: p.fullName || p.id }))

  return NextResponse.json(mapped)
}
