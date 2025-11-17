import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'
import bcrypt from 'bcryptjs'
import { validatePassword } from '@/lib/validation'

export async function PATCH(req: Request) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  
  if (!session || session.role !== 'pilot') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    // Get pilot with password hash
    const pilot = await prisma.pilot.findUnique({
      where: { id: session.userId },
      select: { id: true, passwordHash: true },
    })

    if (!pilot) {
      return NextResponse.json({ error: 'Pilot not found' }, { status: 404 })
    }

    // Verify current password
    if (!pilot.passwordHash) {
      return NextResponse.json({ error: 'No password set. Please contact support.' }, { status: 400 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, pilot.passwordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.pilot.update({
      where: { id: session.userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (err: any) {
    console.error('Failed to update password', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

