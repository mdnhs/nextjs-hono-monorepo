import { Hono } from 'hono'
import { authenticate } from '../middlewares/auth'
import { requireStoreAccess } from '../middlewares/rbac'
import { db } from '../db'
import { assets, subscriptions, plans } from '../db/schema'
import { eq, sum } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'

// This router assumes R2 is available via Cloudflare Bindings
// For local/Node dev, we simulate the logic.
const assetsRouter = new Hono<{ Bindings: { BUCKET: any } }>()

assetsRouter.get('/:storeId', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const data = await db.query.assets.findMany({
    where: eq(assets.storeId, storeId)
  })
  return c.json({ data })
})

assetsRouter.post('/:storeId/upload', authenticate, requireStoreAccess, async (c) => {
  const storeId = c.req.param('storeId')
  const body = await c.req.parseBody()
  const file = body['file'] as File

  if (!file) throw new HTTPException(400, { message: 'No file provided' })

  // 1. Enforce Storage Limit from Plan
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.storeId, storeId),
    with: { plan: true }
  })
  
  const limitMB = sub?.plan?.maxStorageMB || 10
  const limitBytes = limitMB * 1024 * 1024

  const [usage] = await db.select({ total: sum(assets.sizeBytes) })
    .from(assets)
    .where(eq(assets.storeId, storeId))
  
  const currentBytes = Number(usage?.total || 0)
  
  if (currentBytes + file.size > limitBytes) {
    throw new HTTPException(403, { message: `Storage limit exceeded. Upgrade to increase ${limitMB}MB limit.` })
  }

  // 2. Upload to R2 (Multi-tenant path: storeId/fileName)
  const key = `${storeId}/${Date.now()}-${file.name}`
  
  if (c.env.BUCKET) {
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    })
  } else {
    console.log('No R2 Bucket found - simulating upload to:', key)
  }

  const publicUrl = `${process.env.ASSETS_BASE_URL || 'https://assets.example.com'}/${key}`

  // 3. Save to DB
  const [asset] = await db.insert(assets).values({
    storeId,
    url: publicUrl,
    type: file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
    sizeBytes: file.size,
    fileName: file.name
  }).returning()

  return c.json({ data: asset })
})

export default assetsRouter
