import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { idempotencyKeys } from '../db/schema'
import { and, eq, lt } from 'drizzle-orm'

// Idempotency-Key middleware (Stripe-style). Wrap mutating endpoints (POST orders, payments).
//
// Behaviour:
// - Header `Idempotency-Key` required for opt-in routes.
// - First request: insert row (locked), proceed; on completion store response, release lock.
// - Replay (same key + same hash): return stored response.
// - Conflict (same key, different hash): 422.
// - In-flight (locked, no response yet): 409.
//
// Scope = `user:<userId>` if authenticated, else `ip:<ip>` (anonymous flows).

const TTL_MS = 24 * 60 * 60 * 1000 // 24h

const sha256 = async (s: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const computeHash = async (c: Context): Promise<string> => {
  const body = await c.req.raw.clone().text()
  return sha256(`${c.req.method}|${c.req.path}|${body}`)
}

const getScope = (c: Context): string => {
  const user = c.get('user') as { userId?: string } | undefined
  if (user?.userId) return `user:${user.userId}`
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  return `ip:${ip}`
}

export const idempotency = async (c: Context, next: Next) => {
  const key = c.req.header('idempotency-key')
  if (!key) {
    // Optional: enforce on certain routes. For now, only act when header present.
    return next()
  }
  if (key.length < 16 || key.length > 255) {
    throw new HTTPException(400, { message: 'Idempotency-Key must be 16–255 chars' })
  }

  const scope = getScope(c)
  const requestHash = await computeHash(c)

  // Try to claim the key. Insert with lock; if exists, branch.
  const existing = await db.query.idempotencyKeys.findFirst({
    where: and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, key)),
  })

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new HTTPException(422, { message: 'Idempotency-Key reused with different payload' })
    }
    if (existing.completedAt) {
      // Replay stored response.
      return c.json(existing.responseBody as any, (existing.responseStatus ?? 200) as any)
    }
    // Locked + not complete → still in-flight.
    throw new HTTPException(409, { message: 'Request with this Idempotency-Key already in progress' })
  }

  const expiresAt = new Date(Date.now() + TTL_MS)
  try {
    await db.insert(idempotencyKeys).values({
      scope,
      key,
      requestHash,
      lockedAt: new Date(),
      expiresAt,
    })
  } catch {
    // Lost the race — another concurrent insert won. Re-read and replay.
    const winner = await db.query.idempotencyKeys.findFirst({
      where: and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, key)),
    })
    if (winner?.completedAt) {
      return c.json(winner.responseBody as any, (winner.responseStatus ?? 200) as any)
    }
    throw new HTTPException(409, { message: 'Request with this Idempotency-Key already in progress' })
  }

  await next()

  // Capture and persist the response for replay.
  const status = c.res.status
  let body: unknown = null
  try {
    body = await c.res.clone().json()
  } catch {
    // non-JSON response — store as null; replay won't be perfect but key still consumed.
  }
  await db
    .update(idempotencyKeys)
    .set({ responseStatus: status, responseBody: body as any, completedAt: new Date(), lockedAt: null })
    .where(and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, key)))
}

// Background-safe cleanup. Call from a cron / queue worker.
export const purgeExpiredIdempotencyKeys = async (): Promise<number> => {
  const result = await db.delete(idempotencyKeys).where(lt(idempotencyKeys.expiresAt, new Date())).returning({ id: idempotencyKeys.id })
  return result.length
}
