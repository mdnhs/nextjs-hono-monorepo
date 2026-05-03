import { Hono } from 'hono'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireStoreAccess } from '../middlewares/rbac'
import { db } from '../db'
import { themeSettings, pages, navigations, navigationItems } from '../db/schema'
import { eq, and } from 'drizzle-orm'

const cmsRouter = new Hono()

// Theme Settings
cmsRouter.get('/:storeId/theme', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const settings = await db.query.themeSettings.findFirst({
    where: eq(themeSettings.storeId, storeId)
  })
  return c.json({ data: settings || null })
})

cmsRouter.patch('/:storeId/theme', authenticate, requirePermission(PERMISSIONS.STORE_THEME_MANAGE), requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const body = await c.req.json()
  
  const existing = await db.query.themeSettings.findFirst({
    where: eq(themeSettings.storeId, storeId)
  })

  if (existing) {
    const [updated] = await db.update(themeSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(themeSettings.storeId, storeId))
      .returning()
    return c.json({ data: updated })
  } else {
    const [created] = await db.insert(themeSettings)
      .values({ storeId, ...body })
      .returning()
    return c.json({ data: created })
  }
})

// Pages
cmsRouter.get('/:storeId/pages', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const data = await db.query.pages.findMany({
    where: eq(pages.storeId, storeId)
  })
  return c.json({ data })
})

cmsRouter.post('/:storeId/pages', authenticate, requirePermission(PERMISSIONS.STORE_PAGES_MANAGE), requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const body = await c.req.json()
  const [created] = await db.insert(pages).values({ ...body, storeId }).returning()
  return c.json({ data: created })
})

// Navigation
cmsRouter.get('/:storeId/navigation', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const data = await db.query.navigations.findMany({
    where: eq(navigations.storeId, storeId),
    with: { items: true }
  })
  return c.json({ data })
})

export default cmsRouter
