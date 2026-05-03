import { Hono } from 'hono'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { locations, inventoryLevels } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { inventoryService } from '../services/inventory.service'
import { authenticate } from '../middlewares/auth'
import { repoFromContext, requireRepo } from '../db/tenant-repo'

const router = new Hono()

router.use('*', authenticate)

// Locations
router.get('/locations', async (c) => {
  const repo = requireRepo(c)
  const locs = await repo.locations.findMany()
  return c.json({ data: locs, error: false })
})

const createLocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  isDefault: z.boolean().optional(),
})

router.post('/locations', async (c) => {
  const repo = requireRepo(c)
  const body = await c.req.json()
  const parsed = createLocationSchema.safeParse(body)
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid input', cause: parsed.error.flatten() })

  const [loc] = await db.insert(locations).values({
    ...parsed.data,
    storeId: repo.storeId,
  }).returning()

  return c.json({ data: loc, error: false }, 201)
})

// Inventory Levels
router.get('/levels', async (c) => {
  const variantId = c.req.query('variantId')
  if (!variantId) throw new HTTPException(400, { message: 'variantId query param required' })
  
  const stats = await inventoryService.getStock(variantId)
  return c.json({ data: stats, error: false })
})

const adjustSchema = z.object({
  variantId: z.string(),
  locationId: z.string(),
  delta: z.number(),
  reason: z.string(),
})

router.post('/adjust', async (c) => {
  const repo = requireRepo(c)
  const body = await c.req.json()
  const parsed = adjustSchema.safeParse(body)
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid input', cause: parsed.error.flatten() })

  // Security: Ensure location belongs to store
  await repo.assertLocationInStore(parsed.data.locationId)

  const updated = await inventoryService.adjust(parsed.data)
  return c.json({ data: updated, error: false })
})

export default router
