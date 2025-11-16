import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit'
import { validateEmail, sanitizeString } from '@/lib/validation'

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
    const { email, organizationName, contactName, phone, festivalName, festivalLocation, festivalDate, serviceTier } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate and sanitize email
    const validatedEmail = validateEmail(email);
    if (!validatedEmail) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Sanitize other string inputs
    const sanitizedOrganizationName = sanitizeString(organizationName)
    const sanitizedContactName = sanitizeString(contactName)
    const sanitizedPhone = sanitizeString(phone)
    const sanitizedFestivalName = sanitizeString(festivalName)
    const sanitizedFestivalLocation = sanitizeString(festivalLocation)

    // Check if meister already exists
    const existingMeister = await prisma.meister.findUnique({
      where: { email: validatedEmail },
    })

    if (existingMeister) {
      return NextResponse.json({ error: 'A meister with this email already exists' }, { status: 409 })
    }

    // Create meister
    const meister = await prisma.meister.create({
      data: {
        id: crypto.randomUUID(),
        email: validatedEmail,
        organizationName: sanitizedOrganizationName || null,
        contactName: sanitizedContactName || null,
        phone: sanitizedPhone || null,
        festivalName: sanitizedFestivalName || null,
        festivalLocation: sanitizedFestivalLocation || null,
        festivalDate: festivalDate ? new Date(festivalDate) : null,
        serviceTier: serviceTier || 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: { id: true, email: true, organizationName: true },
    })

    return NextResponse.json({ meister }, { status: 201 })
  } catch (err: any) {
    console.error('Failed to register meister', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}

