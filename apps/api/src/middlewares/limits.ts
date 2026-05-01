import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { subscriptionService } from '../services/subscription.service'

export const enforceProductLimit = async (c: Context, next: Next) => {
  const store = c.get('tenantStore')
  if (!store) {
    // If no tenant context, let the route handle it
    return next()
  }

  const result = await subscriptionService.checkPlanLimits(store.id, 'products')

  if (!result.withinLimit) {
    throw new HTTPException(402, {
      message: `Product limit reached (${result.current}/${result.limit}). Upgrade your plan to add more products.`,
    })
  }

  return next()
}

export const enforceOrderLimit = async (c: Context, next: Next) => {
  const store = c.get('tenantStore')
  if (!store) {
    return next()
  }

  const result = await subscriptionService.checkPlanLimits(store.id, 'orders')

  if (!result.withinLimit) {
    throw new HTTPException(402, {
      message: `Order limit reached (${result.current}/${result.limit}). Upgrade your plan to process more orders.`,
    })
  }

  return next()
}
