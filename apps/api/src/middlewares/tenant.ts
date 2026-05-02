import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { stores } from '../db/schema'
import { eq, and } from 'drizzle-orm'

declare module 'hono' {
  interface ContextVariableMap {
    tenantStore: {
      id: string
      slug: string
      status: string
      ownerId: string
    } | null
  }
}

export const resolveTenant = async (c: Context, next: Next) => {
  const host = c.req.header('host') || ''
  const path = c.req.path

  let storeSlug: string | undefined

  const parts = host.split(':')
  const hostname = parts[0]
  const hostParts = hostname.split('.')

  if (hostname.endsWith('.localhost')) {
    // store1.localhost:3000 → slug = store1
    const subdomain = hostname.slice(0, hostname.length - '.localhost'.length)
    if (subdomain) storeSlug = subdomain
  } else if (hostParts.length > 2) {
    const appDomain = process.env.APP_DOMAIN || 'example.com'
    const expectedDomain = `.${appDomain}`
    if (hostname.endsWith(expectedDomain)) {
      storeSlug = hostname.slice(0, hostname.length - expectedDomain.length)
    }
  }

  if (!storeSlug) {
    const match = path.match(/^\/store\/([^/]+)/)
    if (match) {
      storeSlug = match[1]
    }
  }

  if (!storeSlug) {
    const storeByDomain = await db.query.stores.findFirst({
      where: and(eq(stores.customDomain, hostname), eq(stores.status, 'APPROVED')),
      columns: { id: true, slug: true, status: true, ownerId: true },
    })

    if (storeByDomain) {
      c.set('tenantStore', storeByDomain)
      return next()
    }
  }

  if (storeSlug) {
    const store = await db.query.stores.findFirst({
      where: and(eq(stores.slug, storeSlug), eq(stores.status, 'APPROVED')),
      columns: { id: true, slug: true, status: true, ownerId: true },
    })

    if (!store) {
      throw new HTTPException(404, { message: 'Store not found or not approved' })
    }

    c.set('tenantStore', store)
    return next()
  }

  c.set('tenantStore', null)
  return next()
}
