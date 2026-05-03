import { Hono } from 'hono'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireStoreAccess } from '../middlewares/rbac'
import { db } from '../db'
import { storeStaffs, assets, stores, subscriptions, plans } from '../db/schema'
import { eq, and, sum } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'

const staffRouter = new Hono()

staffRouter.get('/:storeId', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const staff = await db.query.storeStaffs.findMany({
    where: eq(storeStaffs.storeId, storeId),
    with: { user: { columns: { id: true, name: true, email: true } } }
  })
  return c.json({ data: staff })
})

staffRouter.post('/:storeId/invite', authenticate, requirePermission(PERMISSIONS.SELLER_STORES_MANAGE), requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const { userId, role } = await c.req.json()
  
  // Real implementation would send email/invite token
  // For now, direct addition
  const [created] = await db.insert(storeStaffs).values({
    storeId,
    userId,
    role
  }).returning()
  
  return c.json({ data: created, message: 'Staff member added' })
})

staffRouter.delete('/:storeId/:staffId', authenticate, requirePermission(PERMISSIONS.SELLER_STORES_MANAGE), requireStoreAccess, async (c) => {
  const { storeId, staffId } = c.req.param()
  await db.delete(storeStaffs).where(and(eq(storeStaffs.id, staffId), eq(storeStaffs.storeId, storeId)))
  return c.json({ message: 'Staff removed' })
})

export default staffRouter
