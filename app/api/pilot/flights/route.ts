import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/sessions'

export async function GET(req: Request) {
  const cookieStore = await cookies()
  const session = await getSession(cookieStore.get('session')?.value)
  if (!session || session.role !== 'pilot') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const flights = await prisma.flight.findMany({
      where: {
        pilotId: session.userId,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(flights)
  } catch (err: any) {
    console.error('fetch flights error', err)
    return new NextResponse(JSON.stringify({ error: err.message || String(err) }), { status: 500 })
  }
}
