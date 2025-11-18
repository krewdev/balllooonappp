import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'
import { validatePhone, sanitizeString, validateNumber } from '@/lib/validation'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  
  if (!session || session.role !== 'pilot') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pilot = await prisma.pilot.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        weightKg: true,
        licenseNumber: true,
        licenseExpiry: true,
        yearsExperience: true,
        totalFlightHours: true,
        insuranceProvider: true,
        insurancePolicyNumber: true,
        insuranceExpiry: true,
        balloonRegistration: true,
        balloonCapacity: true,
      },
    })

    if (!pilot) {
      return NextResponse.json({ error: 'Pilot not found' }, { status: 404 })
    }

    // Serialize Date objects to ISO strings
    const serializedPilot = {
      ...pilot,
      licenseExpiry: pilot.licenseExpiry?.toISOString() || null,
      insuranceExpiry: pilot.insuranceExpiry?.toISOString() || null,
    }

    return NextResponse.json(serializedPilot)
  } catch (err) {
    console.error('Failed to get pilot profile', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  
  if (!session || session.role !== 'pilot') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      fullName,
      phone,
      weightKg,
      licenseNumber,
      licenseExpiry,
      yearsExperience,
      totalFlightHours,
      insuranceProvider,
      insurancePolicyNumber,
      insuranceExpiry,
      balloonRegistration,
      balloonCapacity,
    } = body

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (fullName !== undefined) {
      updateData.fullName = sanitizeString(fullName)
    }

    if (phone !== undefined) {
      const validatedPhone = validatePhone(phone)
      if (!validatedPhone) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
      }
      updateData.phone = validatedPhone
    }

    if (weightKg !== undefined) {
      const validatedWeight = validateNumber(weightKg, 1, 1000)
      if (validatedWeight === null) {
        return NextResponse.json({ error: 'Invalid weight' }, { status: 400 })
      }
      updateData.weightKg = Math.round(validatedWeight)
    }

    if (licenseNumber !== undefined) {
      updateData.licenseNumber = sanitizeString(licenseNumber)
    }

    if (licenseExpiry !== undefined && licenseExpiry !== null) {
      updateData.licenseExpiry = new Date(licenseExpiry)
    }

    if (yearsExperience !== undefined) {
      const validated = validateNumber(yearsExperience, 0, 100)
      if (validated === null) {
        return NextResponse.json({ error: 'Invalid years of experience' }, { status: 400 })
      }
      updateData.yearsExperience = Math.round(validated)
    }

    if (totalFlightHours !== undefined) {
      const validated = validateNumber(totalFlightHours, 0, 100000)
      if (validated === null) {
        return NextResponse.json({ error: 'Invalid total flight hours' }, { status: 400 })
      }
      updateData.totalFlightHours = Math.round(validated)
    }

    if (insuranceProvider !== undefined) {
      updateData.insuranceProvider = sanitizeString(insuranceProvider)
    }

    if (insurancePolicyNumber !== undefined) {
      updateData.insurancePolicyNumber = sanitizeString(insurancePolicyNumber)
    }

    if (insuranceExpiry !== undefined && insuranceExpiry !== null) {
      updateData.insuranceExpiry = new Date(insuranceExpiry)
    }

    if (balloonRegistration !== undefined) {
      updateData.balloonRegistration = sanitizeString(balloonRegistration)
    }

    if (balloonCapacity !== undefined) {
      const validated = validateNumber(balloonCapacity, 1, 20)
      if (validated === null) {
        return NextResponse.json({ error: 'Invalid balloon capacity' }, { status: 400 })
      }
      updateData.balloonCapacity = Math.round(validated)
    }

    const updatedPilot = await prisma.pilot.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        weightKg: true,
        licenseNumber: true,
        licenseExpiry: true,
        yearsExperience: true,
        totalFlightHours: true,
        insuranceProvider: true,
        insurancePolicyNumber: true,
        insuranceExpiry: true,
        balloonRegistration: true,
        balloonCapacity: true,
      },
    })

    // Serialize Date objects to ISO strings
    const serializedPilot = {
      ...updatedPilot,
      licenseExpiry: updatedPilot.licenseExpiry?.toISOString() || null,
      insuranceExpiry: updatedPilot.insuranceExpiry?.toISOString() || null,
    }

    return NextResponse.json({ pilot: serializedPilot, message: 'Profile updated successfully' })
  } catch (err: any) {
    console.error('Failed to update pilot profile', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

