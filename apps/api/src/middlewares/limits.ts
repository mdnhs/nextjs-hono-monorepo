import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { subscriptionService } from '../services/subscription.service'

// Common error formatter for plan-limit failures.
const reject = (
  result: { current: number; limit: number | null; status: string | null },
  resource: string,
) => {
  if (result.status === null) {
    throw new HTTPException(402, { message: 'No active subscription. Please subscribe to a plan.' })
  }
  if (result.status !== 'ACTIVE' && result.status !== 'TRIAL') {
    throw new HTTPException(402, { message: `Subscription ${result.status.toLowerCase()}. Renew to continue.` })
  }
  throw new HTTPException(402, {
    message: `${resource} limit reached (${result.current}/${result.limit}). Upgrade your plan.`,
  })
}

// Helper: pick a storeId from common params, falling back to tenant context.
const pickStoreId = (c: Context): string | null => {
  const fromParams = c.req.param('storeId') ?? c.req.param('id')
  if (fromParams) return fromParams
  const tenant = c.get('tenantStore')
  return tenant?.id ?? null
}

export const enforceProductLimit = async (c: Context, next: Next) => {
  const storeId = pickStoreId(c)
  if (!storeId) return next()

  const result = await subscriptionService.checkPlanLimits(storeId, 'products')
  if (!result.withinLimit) reject(result, 'Product')
  return next()
}

export const enforceOrderLimit = async (c: Context, next: Next) => {
  const storeId = pickStoreId(c)
  if (!storeId) return next()

  const result = await subscriptionService.checkPlanLimits(storeId, 'orders')
  if (!result.withinLimit) reject(result, 'Order')
  return next()
}

// Pre-flight: rejects when adding `incomingMB` to current usage would exceed the storage cap.
// `incomingMB` defaults to 1 — caller can pass a more accurate value (e.g. file size) before upload.
export const enforceStorageLimit = (incomingMB: number = 1) =>
  async (c: Context, next: Next) => {
    const storeId = pickStoreId(c)
    if (!storeId) return next()

    const result = await subscriptionService.checkPlanLimits(storeId, 'storage', Math.max(1, Math.ceil(incomingMB)))
    if (!result.withinLimit) reject(result, 'Storage (MB)')
    return next()
  }

// Per-user store-count limit. Reads userId from `c.get('user')` (auth middleware must run first).
export const enforceStoreLimit = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (!user?.userId) return next()

  const result = await subscriptionService.checkStoreLimit(user.userId)
  if (!result.withinLimit) {
    throw new HTTPException(402, {
      message: `Store limit reached (${result.current}/${result.limit}). Upgrade your plan to add more stores.`,
    })
  }
  return next()
}
