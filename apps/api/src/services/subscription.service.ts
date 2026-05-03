import { db } from '../db'
import { subscriptions, plans, stores, products, orders, assets } from '../db/schema'
import type { BillingCycle, SubscriptionStatus } from '../db/schema'
import { eq, inArray, count, sum } from 'drizzle-orm'
import { BaseService } from './base.service'
import { LRU } from '../utils/lru'

// Per-store subscription+plan cache. 30s TTL — short enough that plan changes propagate quickly,
// long enough to amortize cost when a single seller hammers product/asset creates.
interface CachedPlan {
  storeId: string
  status: string
  maxStores: number | null
  maxProducts: number | null
  maxOrders: number | null
  maxStorageMB: number
}
const PLAN_CACHE = new LRU<string, CachedPlan | null>(2048, 30_000)
const STORE_LIMIT_CACHE = new LRU<string, { limit: number | null }>(2048, 30_000)

export const invalidatePlanCache = (storeId?: string) => {
  if (storeId) PLAN_CACHE.delete(storeId)
  else PLAN_CACHE.clear()
}
export const invalidateStoreLimitCache = (userId?: string) => {
  if (userId) STORE_LIMIT_CACHE.delete(userId)
  else STORE_LIMIT_CACHE.clear()
}

export interface CreateSubscriptionData {
  storeId: string
  planId: string
  billingCycle?: 'MONTHLY' | 'YEARLY'
  trialDays?: number
}

export class SubscriptionService extends BaseService {
  async getSubscriptionByStoreId(storeId: string) {
    return (
      db.query.subscriptions.findFirst({
        where: eq(subscriptions.storeId, storeId),
        with: { plan: true },
      }) ?? null
    )
  }

  async getSubscriptionById(id: string) {
    return (
      db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, id),
        with: { plan: true, store: true },
      }) ?? null
    )
  }

  async createSubscription(data: CreateSubscriptionData) {
    const existing = await this.getSubscriptionByStoreId(data.storeId)
    if (existing) {
      throw new Error('Store already has an active subscription')
    }

    const plan = await db.query.plans.findFirst({ where: eq(plans.id, data.planId) })

    if (!plan) {
      throw new Error('Plan not found')
    }

    const billingCycle: BillingCycle = data.billingCycle || 'MONTHLY'
    const now = new Date()
    const trialDays = data.trialDays !== undefined ? data.trialDays : plan.trialDays

    let status: SubscriptionStatus = 'TRIAL'
    let currentPeriodEnd: Date

    if (trialDays > 0) {
      status = 'TRIAL'
      currentPeriodEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
    } else {
      status = 'ACTIVE'
      currentPeriodEnd = new Date(now)
      if (billingCycle === 'MONTHLY') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
      }
    }

    const [sub] = await db
      .insert(subscriptions)
      .values({
        storeId: data.storeId,
        planId: data.planId,
        billingCycle,
        status,
        currentPeriodStart: now,
        currentPeriodEnd,
      })
      .returning()

    invalidatePlanCache(data.storeId)
    invalidateStoreLimitCache()
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, sub.id),
      with: { plan: true },
    })
  }

  async cancelSubscription(storeId: string) {
    const subscription = await this.getSubscriptionByStoreId(storeId)
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const [updated] = await db
      .update(subscriptions)
      .set({ status: 'CANCELLED', cancelledAt: new Date() })
      .where(eq(subscriptions.storeId, storeId))
      .returning()

    invalidatePlanCache(storeId)
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, updated.id),
      with: { plan: true },
    })
  }

  async updateSubscriptionPlan(storeId: string, newPlanId: string) {
    const subscription = await this.getSubscriptionByStoreId(storeId)
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const newPlan = await db.query.plans.findFirst({ where: eq(plans.id, newPlanId) })

    if (!newPlan) {
      throw new Error('New plan not found')
    }

    const now = new Date()
    const newPeriodEnd = new Date(now)
    if (subscription.billingCycle === 'MONTHLY') {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)
    } else {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1)
    }

    const [updated] = await db
      .update(subscriptions)
      .set({
        planId: newPlanId,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        status: 'ACTIVE',
        cancelledAt: null,
      })
      .where(eq(subscriptions.storeId, storeId))
      .returning()

    invalidatePlanCache(storeId)
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, updated.id),
      with: { plan: true },
    })
  }

  // Reads plan caps from cache; falls back to DB. Returns null if no subscription (caller decides what to do).
  // Cron entrypoint. Flips ACTIVE/TRIAL subscriptions to EXPIRED when their period has elapsed.
  // Returns the number of rows touched. Caller (worker) emits webhook events.
  async expireOverdueSubscriptions(): Promise<{ expiredStoreIds: string[] }> {
    const now = new Date()
    const overdue = await db.query.subscriptions.findMany({
      where: (s, { and, inArray, lt }) =>
        and(inArray(s.status, ['ACTIVE', 'TRIAL'] as const), lt(s.currentPeriodEnd, now)),
      columns: { id: true, storeId: true },
    })
    if (overdue.length === 0) return { expiredStoreIds: [] }

    await db
      .update(subscriptions)
      .set({ status: 'EXPIRED', expiresAt: now })
      .where(
        inArray(
          subscriptions.id,
          overdue.map((s) => s.id),
        ),
      )

    for (const s of overdue) invalidatePlanCache(s.storeId)
    return { expiredStoreIds: overdue.map((s) => s.storeId) }
  }

  private async loadCachedPlan(storeId: string): Promise<CachedPlan | null> {
    const cached = PLAN_CACHE.get(storeId)
    if (cached !== undefined) return cached

    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.storeId, storeId),
      with: { plan: true },
    })

    const value: CachedPlan | null = sub
      ? {
          storeId,
          status: sub.status,
          maxStores: sub.plan.maxStores,
          maxProducts: sub.plan.maxProducts,
          maxOrders: sub.plan.maxOrders,
          maxStorageMB: sub.plan.maxStorageMB,
        }
      : null
    PLAN_CACHE.set(storeId, value)
    return value
  }

  async checkPlanLimits(
    storeId: string,
    type: 'products' | 'orders' | 'storage',
    delta = 1,
  ): Promise<{ withinLimit: boolean; current: number; limit: number | null; status: string | null }> {
    const cached = await this.loadCachedPlan(storeId)
    if (!cached) {
      // No subscription = no plan caps available. Treat as locked (force seller to subscribe).
      return { withinLimit: false, current: 0, limit: 0, status: null }
    }

    // Suspended subs cannot accrue more usage either.
    if (cached.status === 'CANCELLED' || cached.status === 'EXPIRED' || cached.status === 'PAST_DUE') {
      return { withinLimit: false, current: 0, limit: 0, status: cached.status }
    }

    let current: number
    let limit: number | null

    switch (type) {
      case 'products': {
        const [{ cnt }] = await db.select({ cnt: count() }).from(products).where(eq(products.storeId, storeId))
        current = Number(cnt)
        limit = cached.maxProducts
        break
      }
      case 'orders': {
        const [{ cnt }] = await db.select({ cnt: count() }).from(orders).where(eq(orders.storeId, storeId))
        current = Number(cnt)
        limit = cached.maxOrders
        break
      }
      case 'storage': {
        // Sum of Asset.sizeBytes, expressed in MB. delta arrives in MB too.
        const [row] = await db
          .select({ total: sum(assets.sizeBytes) })
          .from(assets)
          .where(eq(assets.storeId, storeId))
        current = Math.ceil(Number(row?.total ?? 0) / (1024 * 1024))
        limit = cached.maxStorageMB
        break
      }
      default:
        throw new Error('Invalid limit type')
    }

    return {
      withinLimit: limit === null || current + delta <= limit,
      current,
      limit,
      status: cached.status,
    }
  }

  async checkStoreLimit(
    userId: string
  ): Promise<{ withinLimit: boolean; current: number; limit: number | null }> {
    const [{ storeCount }] = await db
      .select({ storeCount: count() })
      .from(stores)
      .where(eq(stores.ownerId, userId))

    const userStores = await db.query.stores.findMany({
      where: eq(stores.ownerId, userId),
      columns: { id: true },
    })

    const storeIds = userStores.map((s) => s.id)

    let limit: number | null = null

    if (storeIds.length > 0) {
      const subs = await db.query.subscriptions.findMany({
        where: inArray(subscriptions.storeId, storeIds),
        with: { plan: true },
      })

      const activeSubs = subs.filter((s) => s.status === 'ACTIVE' || s.status === 'TRIAL')

      for (const sub of activeSubs) {
        if (sub.plan.maxStores === null) {
          limit = null
          break
        }
        if (limit === null || sub.plan.maxStores > limit) {
          limit = sub.plan.maxStores
        }
      }
    }

    return {
      withinLimit: limit === null || Number(storeCount) < limit,
      current: Number(storeCount),
      limit,
    }
  }

}

export const subscriptionService = new SubscriptionService()
