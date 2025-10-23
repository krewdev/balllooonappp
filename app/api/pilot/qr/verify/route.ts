import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

function constantTimeCompare(a: string, b: string) {
  try {
    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')
  return (crypto as any).timingSafeEqual(bufA, bufB)
  } catch (_e) {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payloadStr = body?.payload
    if (!payloadStr || typeof payloadStr !== 'string') {
      return NextResponse.json({ valid: false, reason: 'missing payload' }, { status: 400 })
    }

    let obj: any
    try {
      obj = JSON.parse(payloadStr)
    } catch (err) {
      return NextResponse.json({ valid: false, reason: 'invalid json' }, { status: 400 })
    }

    const { sig } = obj
    if (!sig) return NextResponse.json({ valid: false, reason: 'missing signature' }, { status: 400 })

    const signingSecret = process.env.QR_SIGNING_SECRET || 'dev-qr-secret'
    // Recreate the unsigned payload by cloning and deleting sig
    const unsigned = { ...obj }
    delete unsigned.sig
    const unsignedStr = JSON.stringify(unsigned)

    const expected = crypto.createHmac('sha256', signingSecret).update(unsignedStr).digest('hex')
    if (!constantTimeCompare(expected, sig)) {
      return NextResponse.json({ valid: false, reason: 'invalid signature' }, { status: 401 })
    }

    const now = Math.floor(Date.now() / 1000)
    const iat = Number(unsigned.iat || 0)
    const maxAge = Number(process.env.QR_MAX_AGE_SECONDS || 60 * 60 * 24) // default 24h
    if (!iat || Math.abs(now - iat) > maxAge) {
      return NextResponse.json({ valid: false, reason: 'expired' }, { status: 401 })
    }

    // Optionally verify pilot exists
    const pilot = await prisma.pilot.findUnique({ where: { id: unsigned.id }, select: { id: true, email: true } })
    if (!pilot) return NextResponse.json({ valid: false, reason: 'pilot not found' }, { status: 404 })

    // Success
    return NextResponse.json({ valid: true, id: pilot.id, email: pilot.email })
  } catch (err) {
    console.error('QR verify error', err)
    return NextResponse.json({ valid: false, reason: 'internal' }, { status: 500 })
  }
}
