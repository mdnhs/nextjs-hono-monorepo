import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { stores } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { LRU } from '../utils/lru'

export interface TenantStore {
  id: string
  slug: string
  status: string
  ownerId: string
}

declare module 'hono' {
  interface ContextVariableMap {
    tenantStore: TenantStore | null
  }
}

// Cache: host (or `slug:<x>`) → TenantStore. 60s TTL, ~1k tenant capacity.
// Negative cache prevents repeated DB hits for unknown hosts.
const TENANT_CACHE = new LRU<string, TenantStore | null>(1024, 60_000)

export const invalidateTenantCache = (key?: string): void => {
  if (key) TENANT_CACHE.delete(key)
  else TENANT_CACHE.clear()
}

const lookupBySlug = async (slug: string): Promise<TenantStore | null> => {
  const cacheKey = `slug:${slug}`
  const cached = TENANT_CACHE.get(cacheKey)
  if (cached !== undefined) return cached

  const store = (await db.query.stores.findFirst({
    where: and(eq(stores.slug, slug), eq(stores.status, 'APPROVED')),
    columns: { id: true, slug: true, status: true, ownerId: true },
  })) ?? null

  TENANT_CACHE.set(cacheKey, store)
  return store
}

const lookupByDomain = async (hostname: string): Promise<TenantStore | null> => {
  const cacheKey = `host:${hostname}`
  const cached = TENANT_CACHE.get(cacheKey)
  if (cached !== undefined) return cached

  const store = (await db.query.stores.findFirst({
    where: and(eq(stores.customDomain, hostname), eq(stores.status, 'APPROVED')),
    columns: { id: true, slug: true, status: true, ownerId: true },
  })) ?? null

  TENANT_CACHE.set(cacheKey, store)
  return store
}

export const resolveTenant = async (c: Context, next: Next) => {
  const host = c.req.header('host') ?? ''
  const path = c.req.path

  let storeSlug: string | undefined

  const hostname = host.split(':')[0] ?? ''
  const hostParts = hostname.split('.')

  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.slice(0, hostname.length - '.localhost'.length)
    if (subdomain) storeSlug = subdomain
  } else if (hostParts.length > 2) {
    const appDomain = process.env.APP_DOMAIN ?? 'example.com'
    const expectedDomain = `.${appDomain}`
    if (hostname.endsWith(expectedDomain)) {
      storeSlug = hostname.slice(0, hostname.length - expectedDomain.length)
    }
  }

  if (!storeSlug) {
    const match = path.match(/^\/store\/([^/]+)/)
    if (match) storeSlug = match[1]
  }

  if (!storeSlug) {
    const store = await lookupByDomain(hostname)
    if (store) {
      c.set('tenantStore', store)
      return next()
    }
  }

  if (storeSlug) {
    const store = await lookupBySlug(storeSlug)
    if (!store) {
      throw new HTTPException(404, { message: 'Store not found or not approved' })
    }
    c.set('tenantStore', store)
    return next()
  }

  c.set('tenantStore', null)
  return next()
}
