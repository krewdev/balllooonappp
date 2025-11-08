import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Validate pilot exists
    const pilot = await prisma.pilot.findUnique({ where: { id }, select: { id: true } });
    if (!pilot) return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });

    // The URL the QR code will point to
    const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/passenger/register?pilotId=${pilot.id}`;

    return NextResponse.json({ url: registrationUrl });

  } catch (err) {
    console.error('Failed to generate QR URL', err);
    return NextResponse.json({ error: 'Failed to generate QR URL' }, { status: 500 });
  }
}
