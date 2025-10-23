import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}

    // Simple development-only auth logic
    if (email === "pilot@example.com" && password === "pilotpass") {
      const payload = {
        token: "dev-token-pilot-123",
        user: {
          id: "pilot-123",
          role: "pilot",
          email: "pilot@example.com",
          name: "John Doe",
        },
      }

      return NextResponse.json(payload)
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
