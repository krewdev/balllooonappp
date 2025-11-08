import { NextResponse } from "next/server";
import { createSession } from "@/lib/sessions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body; // role can be 'pilot' or 'passenger'

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    let user: { id: string; passwordHash: string | null } | null = null;

    if (role === "pilot") {
      user = await prisma.pilot.findUnique({
        where: { email },
        select: { id: true, passwordHash: true },
      });
    } else if (role === "passenger") {
      user = await prisma.passenger.findUnique({
        where: { email },
        select: { id: true, passwordHash: true },
      });
    } else {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionId = await createSession(user.id, role);

    const res = NextResponse.json({ ok: true, user: { id: user.id, email } });
    const cookieOptions = [
      `session=${sessionId}`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      process.env.NODE_ENV === "production" ? `Secure` : "",
      `Max-Age=${60 * 60 * 24 * 7}`, // 7 days
    ]
      .filter(Boolean)
      .join("; ");

    res.headers.set("Set-Cookie", cookieOptions);
    return res;
    
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
