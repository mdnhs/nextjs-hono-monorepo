import { Hono } from 'hono'
import { authenticate } from '../middlewares/auth'
import { requireStoreAccess } from '../middlewares/rbac'
import { enforceStorageLimit } from '../middlewares/limits'
import { db } from '../db'
import { assets } from '../db/schema'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { subscriptionService } from '../services/subscription.service'

const assetsRouter = new Hono<{ Bindings: { BUCKET: any } }>()

assetsRouter.get('/:storeId', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')!
  const data = await db.query.assets.findMany({ where: eq(assets.storeId, storeId) })
  return c.json({ data })
})

// Soft pre-flight: middleware checks current usage with delta=1MB. Final check below uses real file size.
assetsRouter.post(
  '/:storeId/upload',
  authenticate,
  requireStoreAccess,
  enforceStorageLimit(1),
  async (c) => {
    const storeId = c.req.param('storeId')!
    const body = await c.req.parseBody()
    const file = body['file'] as File | undefined
    if (!file) throw new HTTPException(400, { message: 'No file provided' })

    // Hard check with the real file size now that we have it.
    const incomingMB = Math.max(1, Math.ceil(file.size / (1024 * 1024)))
    const result = await subscriptionService.checkPlanLimits(storeId, 'storage', incomingMB)
    if (!result.withinLimit) {
      throw new HTTPException(402, {
        message: `Storage limit exceeded (${result.current}MB/${result.limit}MB). Upgrade your plan.`,
      })
    }

    const key = `${storeId}/${Date.now()}-${file.name}`
    if (c.env.BUCKET) {
      await c.env.BUCKET.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
      })
    } else {
      console.log('No R2 Bucket bound — skipping upload of', key)
    }

    const publicUrl = `${process.env.ASSETS_BASE_URL ?? 'https://assets.example.com'}/${key}`

    const [asset] = await db
      .insert(assets)
      .values({
        storeId,
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
        sizeBytes: file.size,
        fileName: file.name,
      })
      .returning()

    return c.json({ data: asset })
  },
)

export default assetsRouter
