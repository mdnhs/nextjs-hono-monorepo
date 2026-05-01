import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { prisma } from '../utils/prisma'

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

  // Check for subdomain: store.example.com
  const parts = host.split(':')
  const hostname = parts[0]
  const hostParts = hostname.split('.')

  // If we have a subdomain (not localhost or www)
  if (hostParts.length > 2 && !hostname.includes('localhost')) {
    const appDomain = process.env.APP_DOMAIN || 'example.com'
    const expectedDomain = `.${appDomain}`
    if (hostname.endsWith(expectedDomain)) {
      storeSlug = hostname.replace(expectedDomain, '')
    }
  }

  // Check for path-based: /store/:slug/...
  if (!storeSlug) {
    const match = path.match(/^\/store\/([^/]+)/)
    if (match) {
      storeSlug = match[1]
    }
  }

  // Check for custom domain
  if (!storeSlug) {
    const storeByDomain = await prisma.store.findFirst({
      where: {
        customDomain: hostname,
        status: 'APPROVED',
      },
      select: { id: true, slug: true, status: true, ownerId: true },
    })

    if (storeByDomain) {
      c.set('tenantStore', storeByDomain)
      return next()
    }
  }

  // Resolve store by slug
  if (storeSlug) {
    const store = await prisma.store.findFirst({
      where: {
        slug: storeSlug,
        status: 'APPROVED',
      },
      select: { id: true, slug: true, status: true, ownerId: true },
    })

    if (!store) {
      throw new HTTPException(404, { message: 'Store not found or not approved' })
    }

    c.set('tenantStore', store)
    return next()
  }

  // No tenant context - this is OK for public endpoints
  c.set('tenantStore', null)
  return next()
}
