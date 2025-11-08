# Session Storage Migration Guide

## Problem

File-based sessions (`.next/sessions.json`) won't work in serverless/production because:
- Files don't persist between serverless function invocations
- No shared file system across multiple instances
- Vercel/serverless platforms use read-only file systems

## Solution Options

### Option 1: Database-Backed Sessions (Recommended)

Add a Session model to your database.

#### Step 1: Update Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  role      String
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([expiresAt])
}
```

#### Step 2: Create Migration

```bash
npx prisma migrate dev --name add_sessions
```

#### Step 3: Update lib/sessions.ts

Replace the file with database implementation:

```typescript
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

export async function getSession(sessionId: string | null | undefined) {
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
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

export async function destroySession(sessionId: string) {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // Session might not exist, ignore error
  });
}

// Cleanup expired sessions (run periodically via cron or on session creation)
export async function cleanupExpiredSessions() {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
```

### Option 2: Redis/Upstash (For High Performance)

If you need faster session access:

#### Setup Upstash Redis

1. Create account at https://upstash.com
2. Create Redis database
3. Copy connection string

#### Install Redis Client

```bash
npm install @upstash/redis
```

#### Update lib/sessions.ts

```typescript
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

type SessionData = {
  userId: string;
  role: string;
};

export async function createSession(userId: string, role = 'pilot'): Promise<string> {
  const sessionId = crypto.randomBytes(24).toString('hex');
  
  await redis.setex(
    `session:${sessionId}`,
    SESSION_TTL,
    JSON.stringify({ userId, role })
  );
  
  return sessionId;
}

export async function getSession(sessionId: string | null | undefined) {
  if (!sessionId) return null;

  const data = await redis.get<string>(`session:${sessionId}`);
  if (!data) return null;

  return JSON.parse(data) as SessionData;
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  const session = await getSession(sessionId);

  if (!session) return null;

  return {
    pilotId: session.userId,
    role: session.role,
  };
}

export async function destroySession(sessionId: string) {
  await redis.del(`session:${sessionId}`);
}
```

### Option 3: JWT-Based Sessions (Stateless)

For completely stateless authentication:

```bash
npm install jose
```

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars');
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId: string, role = 'pilot'): Promise<string> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET);
  
  return token;
}

export async function getSession(token: string | null | undefined) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const session = await getSession(token);

  if (!session) return null;

  return {
    pilotId: session.userId,
    role: session.role,
  };
}

export async function destroySession(sessionId: string) {
  // With JWT, just clear the cookie client-side
  // Can't invalidate server-side without a blacklist
}
```

## Comparison

| Feature | Database | Redis | JWT |
|---------|----------|-------|-----|
| Setup Complexity | Medium | Medium | Low |
| Performance | Good | Excellent | Excellent |
| Cost | Included with DB | $0-10/month | Free |
| Session Invalidation | Easy | Easy | Hard |
| Scalability | Good | Excellent | Excellent |
| Data Persistence | Permanent | Configurable | N/A |

## Recommendation

**For Your App**: Use **Database-Backed Sessions (Option 1)**

Why:
- You already have a database
- Easy to implement
- Can query sessions by user
- Good performance for your scale
- No additional services needed

## Implementation Steps

1. **Choose your option** (recommend Option 1)
2. **Update Prisma schema** (if using database)
3. **Create migration**: `npx prisma migrate dev`
4. **Replace** `lib/sessions.ts` with new implementation
5. **Update** login routes to use async session functions
6. **Test** authentication flow
7. **Deploy** and verify sessions persist

## Testing

```bash
# Test session creation
node -e "
const { createSession, getSession } = require('./lib/sessions');
(async () => {
  const id = await createSession('user-123', 'pilot');
  console.log('Session ID:', id);
  const session = await getSession(id);
  console.log('Retrieved:', session);
})();
"
```

## Migration from File-Based

Current users will need to re-login after deploying the new session system. This is normal and expected.

Optional: Add a migration notice to your login page.
