import { NextResponse } from "next/server"
import { createSession } from '@/lib/sessions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    // Simple development-only auth logic
    if (email === "pilot@example.com" && password === "pilotpass") {
      const userId = "pilot-123"
      const sessionId = createSession(userId, 'pilot')

      // Set HttpOnly cookie
      const res = NextResponse.json({ ok: true, user: { id: userId, email } })
      const cookieOptions = [
        `session=${sessionId}`,
        `Path=/`,
        `HttpOnly`,
        `SameSite=Lax`,
        process.env.NODE_ENV === 'production' ? `Secure` : '',
        `Max-Age=${60 * 60 * 24 * 7}`,
      ]
        .filter(Boolean)
        .join('; ')

      res.headers.set('Set-Cookie', cookieOptions)
      return res
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
