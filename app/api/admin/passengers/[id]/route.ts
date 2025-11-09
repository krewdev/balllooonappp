import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    const session = await getSession(sessionId);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { blocked } = body;

    if (typeof blocked !== "boolean") {
      return NextResponse.json(
        { error: "Blocked must be a boolean" },
        { status: 400 }
      );
    }

    const passenger = await prisma.passenger.update({
      where: { id },
      data: { blocked },
    });

    return NextResponse.json(passenger);
  } catch (error) {
    console.error("Failed to update passenger:", error);
    return NextResponse.json(
      { error: "Failed to update passenger" },
      { status: 500 }
    );
  }
}
