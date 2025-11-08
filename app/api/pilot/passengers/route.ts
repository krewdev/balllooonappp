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

    const passengers = await prisma.passenger.findMany({
      where: { pilotId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(passengers);
  } catch (error) {
    console.error("Failed to fetch passengers:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
