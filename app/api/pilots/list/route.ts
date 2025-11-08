import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pilots = await prisma.pilot.findMany({
      where: {
        approved: true,
      },
      select: {
        id: true,
        fullName: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
    return NextResponse.json(pilots);
  } catch (error) {
    console.error('Failed to fetch pilots:', error);
    return NextResponse.json({ error: 'Failed to fetch pilots' }, { status: 500 });
  }
}
