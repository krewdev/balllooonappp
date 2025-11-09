import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { getSession } from "@/lib/sessions"

// Optional Twilio SMS integration
let twilioClient: any = null
const twSid = process.env.TWILIO_ACCOUNT_SID
const twToken = process.env.TWILIO_AUTH_TOKEN
const twFrom = process.env.TWILIO_PHONE_NUMBER
if (twSid && twToken) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Twilio = require("twilio")
    twilioClient = Twilio(twSid, twToken)
  } catch {}
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const flightId = params.id
    const body = (await req.json()) as {
      message?: string
      toPhones?: string[]
    }

    // Require authenticated pilot and ownership of the flight
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value
    const session = await getSession(sessionId)
    if (!session || session.role !== "pilot") {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }

    const flight = await prisma.flight.findUnique({ where: { id: flightId }, include: { pilot: true } })
    if (!flight) return NextResponse.json({ ok: false, error: "flight not found" }, { status: 404 })
    if (flight.pilotId !== session.userId) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const link = `${baseUrl}/passenger/book/${flightId}`
    const msg =
      body.message ||
      `Balloon availability: ${flight.title} at ${flight.location} on ${new Date(flight.date).toLocaleString()}. Book and pay: ${link}`

    const recipients = body.toPhones || []
    if (!recipients.length) {
      return NextResponse.json({ ok: false, error: "no recipients provided" }, { status: 400 })
    }

    // Normalize recipients to E.164; assume US (+1) if 10 digits without country
    const normalize = (s: string): { ok: boolean; to?: string } => {
      const trimmed = (s || "").trim()
      if (!trimmed) return { ok: false }
      if (trimmed.startsWith("+")) {
        const digits = trimmed.replace(/[^+\d]/g, "")
        return /^\+\d{7,15}$/.test(digits) ? { ok: true, to: digits } : { ok: false }
      }
      const digitsOnly = trimmed.replace(/\D/g, "")
      if (/^\d{10}$/.test(digitsOnly)) {
        return { ok: true, to: `+1${digitsOnly}` }
      }
      if (/^1\d{10}$/.test(digitsOnly)) {
        return { ok: true, to: `+${digitsOnly}` }
      }
      return { ok: false }
    }

    const valid: string[] = []
    const invalid: string[] = []
    for (const raw of recipients) {
      const n = normalize(raw)
      if (n.ok && n.to) valid.push(n.to)
      else invalid.push(raw)
    }

    const results: any[] = []
    for (const to of valid) {
      if (twilioClient && twFrom) {
        try {
          const m = await twilioClient.messages.create({ from: twFrom, to, body: msg })
          results.push({ to, sid: m.sid })
        } catch (e: any) {
          results.push({ to, error: e?.message || "send failed" })
        }
      } else {
        console.log("[notify] SMS (mock)", { to, body: msg })
        results.push({ to, mocked: true })
      }
    }

    return NextResponse.json({ ok: true, results, invalid })
  } catch (err) {
    console.error("notify error", err)
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 })
  }
}
