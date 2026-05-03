import { Hono } from 'hono'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { webhooks } from '../db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { authenticate } from '../middlewares/auth'
import { requireRepo } from '../db/tenant-repo'
import { createId } from '@paralleldrive/cuid2'

const router = new Hono()

router.use('*', authenticate)

router.get('/', async (c) => {
  const tenant = c.get('tenantStore')
  if (!tenant) throw new HTTPException(400, { message: 'Tenant context required' })

  const subs = await db.query.webhooks.findMany({
    where: and(eq(webhooks.storeId, tenant.id), isNull(webhooks.deletedAt))
  })
  return c.json({ data: subs, error: false })
})

const createWebhookSchema = z.object({
  topic: z.string(),
  url: z.string().url(),
})

router.post('/', async (c) => {
  const tenant = c.get('tenantStore')
  if (!tenant) throw new HTTPException(400, { message: 'Tenant context required' })

  const body = await c.req.json()
  const parsed = createWebhookSchema.safeParse(body)
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid input', cause: parsed.error.flatten() })

  const [sub] = await db.insert(webhooks).values({
    ...parsed.data,
    storeId: tenant.id,
    secret: createId(), // Signing secret
    isActive: true,
  }).returning()

  return c.json({ data: sub, error: false }, 201)
})

router.delete('/:id', async (c) => {
  const tenant = c.get('tenantStore')
  if (!tenant) throw new HTTPException(400, { message: 'Tenant context required' })
  
  const id = c.req.param('id')
  await db.update(webhooks)
    .set({ deletedAt: new Date(), isActive: false })
    .where(and(eq(webhooks.id, id), eq(webhooks.storeId, tenant.id)))

  return c.json({ message: 'Webhook deleted', error: false })
})

export default router
