import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

type Session = {
  userId: string;
  role: string;
};

type SessionData = {
  pilotId: string;
  role: string;
};

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId: string, role = 'pilot'): Promise<string> {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL);
  
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      role,
      expiresAt,
    },
  });
  
  return sessionId;
}

export async function getSession(sessionId: string | null | undefined): Promise<Session | null> {
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, role: true, expiresAt: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await destroySession(sessionId);
    return null;
  }

  return {
    userId: session.userId,
    role: session.role,
  };
}

export async function getServerSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  const session = await getSession(sessionId);

  if (!session) {
    return null;
  }

  return {
    pilotId: session.userId,
    role: session.role,
  };
}

export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // Session might not exist, ignore error
  });
}

// Cleanup expired sessions (can be called periodically or on each session creation)
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
