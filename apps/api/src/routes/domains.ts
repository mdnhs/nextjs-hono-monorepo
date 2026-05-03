import { Hono } from 'hono'
import { z } from 'zod'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireStoreAccess } from '../middlewares/rbac'
import { domainService } from '../services/domain.service'

const router = new Hono()

const requestSchema = z.object({ hostname: z.string().min(3) })

// On-demand TLS endpoint: Caddy hits this to know whether it should serve a cert for `?domain=`.
// Returns 200 if the domain is bound to a store, 404 otherwise. Caddy treats non-200 as "do not issue".
// No auth — Caddy is calling, not the seller. Public prefix declared in index.ts.
router.get('/check', async (c) => {
  const host = c.req.query('domain')?.toLowerCase()
  if (!host) return c.text('missing domain', 400)
  const found = await domainService.listByHostname(host)
  return found ? c.text('ok') : c.text('not found', 404)
})

router.post(
  '/store/:storeId/request',
  authenticate,
  requirePermission(PERMISSIONS.SELLER_STORES_MANAGE),
  requireStoreAccess,
  async (c) => {
    const storeId = c.req.param('storeId')!
    const body = requestSchema.parse(await c.req.json())
    const data = await domainService.requestVerification(storeId, body.hostname)
    return c.json({ data, error: false, message: 'Add the TXT record then call /check.' })
  },
)

router.post(
  '/store/:storeId/:verificationId/check',
  authenticate,
  requirePermission(PERMISSIONS.SELLER_STORES_MANAGE),
  requireStoreAccess,
  async (c) => {
    const id = c.req.param('verificationId')!
    const data = await domainService.checkVerification(id)
    return c.json({ data, error: false, message: 'Status updated' })
  },
)

router.get(
  '/store/:storeId',
  authenticate,
  requirePermission(PERMISSIONS.SELLER_STORES_MANAGE),
  requireStoreAccess,
  async (c) => {
    const storeId = c.req.param('storeId')!
    const data = await domainService.listForStore(storeId)
    return c.json({ data, error: false, message: 'OK' })
  },
)

router.delete(
  '/store/:storeId/:verificationId',
  authenticate,
  requirePermission(PERMISSIONS.SELLER_STORES_MANAGE),
  requireStoreAccess,
  async (c) => {
    await domainService.remove(c.req.param('verificationId')!)
    return c.json({ data: null, error: false, message: 'Removed' })
  },
)

export default router
