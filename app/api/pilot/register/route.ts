import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, weightKg, licenseNumber, licenseExpiry } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Hash password if provided
    let passwordHash: string | undefined = undefined
    if (password) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    // NOTE: After updating the Prisma schema (added `approved`), run:
    //   pnpm prisma migrate dev --name add-pilot-approved
    //   pnpm prisma generate
    // Also install bcryptjs in your environment: pnpm add -D bcryptjs

    const pilot = await prisma.pilot.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        weightKg: weightKg ? parseInt(String(weightKg), 10) : undefined,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        // ensure admin approval flow: approved defaults to false in schema
      },
      select: { id: true, email: true, fullName: true },
    })

    return NextResponse.json({ pilot }, { status: 201 })
  } catch (err: any) {
    console.error('Failed to register pilot', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
