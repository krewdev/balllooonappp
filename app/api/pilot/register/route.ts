import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateEmail, sanitizeString, validatePassword } from '@/lib/validation'

export async function POST(request: Request) {
  // Rate limiting
  const rateLimit = checkRateLimit(request, rateLimitConfigs.registration);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: "Too many registration attempts. Please try again later.",
        retryAfter: rateLimit.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter || 3600),
        }
      }
    );
  }

  try {
    const body = await request.json()
    const { email, password, fullName, phone, weightKg, licenseNumber, licenseExpiry } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate and sanitize email
    const validatedEmail = validateEmail(email);
    if (!validatedEmail) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Sanitize other string inputs
    const sanitizedFullName = sanitizeString(fullName)
    const sanitizedPhone = sanitizeString(phone)
    const sanitizedLicenseNumber = sanitizeString(licenseNumber)

    // Validate password complexity
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { 
            error: "Password does not meet requirements",
            details: passwordValidation.errors
          },
          { status: 400 }
        );
      }
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
        id: crypto.randomUUID(),
        email: validatedEmail,
        passwordHash,
        fullName: sanitizedFullName || null,
        phone: sanitizedPhone || null,
        weightKg: weightKg ? parseInt(String(weightKg), 10) : undefined,
        licenseNumber: sanitizedLicenseNumber || null,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
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
