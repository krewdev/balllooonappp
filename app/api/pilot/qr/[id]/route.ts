import { NextResponse } from 'next/server'
import * as QRCode from 'qrcode'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
  const id = params.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Validate pilot exists
    const pilot = await prisma.pilot.findUnique({ where: { id }, select: { id: true, email: true } })
    if (!pilot) return NextResponse.json({ error: 'Pilot not found' }, { status: 404 })

    // Create QR payload — include pilot id, email, issued-at and an HMAC signature
    const iat = Math.floor(Date.now() / 1000)
    const signingSecret = process.env.QR_SIGNING_SECRET || 'dev-qr-secret'
    const payloadObj = { id: pilot.id, email: pilot.email, iat }
    const payloadStr = JSON.stringify(payloadObj)
    const sig = crypto.createHmac('sha256', signingSecret).update(payloadStr).digest('hex')
    const signedPayload = JSON.stringify({ ...payloadObj, sig })

    // Support format query param: svg (default) or png
    const url = new URL(req.url)
    const format = (url.searchParams.get('format') || 'svg').toLowerCase()
    const filenameBase = `pilot-${pilot.id}`

    if (format === 'png') {
      // Generate PNG buffer
      const png = await QRCode.toBuffer(signedPayload, { type: 'png', width: 512 })
      return new NextResponse(png, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${filenameBase}.png"`,
        },
      })
    }

    // Default: SVG
    const svg = await QRCode.toString(signedPayload, { type: 'svg', width: 512 })
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${filenameBase}.svg"`,
      },
    })
  } catch (err) {
    console.error('Failed to generate QR', err)
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 })
  }
}
