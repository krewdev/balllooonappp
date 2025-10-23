import crypto from 'crypto'

type Session = {
  userId: string
  role: string
  expiresAt: number
}

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7 // 7 days

// In-memory sessions store for development. Replace with a persistent store for production.
const sessions = new Map<string, Session>()

export function createSession(userId: string, role = 'pilot') {
  const sessionId = crypto.randomBytes(24).toString('hex')
  const expiresAt = Date.now() + SESSION_TTL
  sessions.set(sessionId, { userId, role, expiresAt })
  return sessionId
}

export function getSession(sessionId: string | null | undefined) {
  if (!sessionId) return null
  const s = sessions.get(sessionId)
  if (!s) return null
  if (s.expiresAt < Date.now()) {
    sessions.delete(sessionId)
    return null
  }
  return s
}

export function destroySession(sessionId: string) {
  sessions.delete(sessionId)
}
