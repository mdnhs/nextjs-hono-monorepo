import { db } from '../db'
import { subscriptions, plans, stores, products, orders } from '../db/schema'
import type { BillingCycle, SubscriptionStatus } from '../db/schema'
import { eq, inArray, count } from 'drizzle-orm'
import { BaseService } from './base.service'

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

    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, updated.id),
      with: { plan: true },
    })
  }

  async checkPlanLimits(
    storeId: string,
    type: 'products' | 'orders' | 'storage'
  ): Promise<{ withinLimit: boolean; current: number; limit: number | null }> {
    const subscription = await this.getSubscriptionByStoreId(storeId)
    if (!subscription) {
      throw new Error('No subscription found for store')
    }

    const plan = await db.query.plans.findFirst({ where: eq(plans.id, subscription.planId) })

    if (!plan) {
      throw new Error('Plan not found')
    }

    let current: number
    let limit: number | null

    switch (type) {
      case 'products': {
        const [{ cnt }] = await db.select({ cnt: count() }).from(products).where(eq(products.storeId, storeId))
        current = Number(cnt)
        limit = plan.maxProducts
        break
      }
      case 'orders': {
        const [{ cnt }] = await db.select({ cnt: count() }).from(orders).where(eq(orders.storeId, storeId))
        current = Number(cnt)
        limit = plan.maxOrders
        break
      }
      case 'storage': {
        current = await this.getStoreStorageUsed(storeId)
        limit = plan.maxStorageMB
        break
      }
      default:
        throw new Error('Invalid limit type')
    }

    return {
      withinLimit: limit === null || current < limit,
      current,
      limit,
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

  private async getStoreStorageUsed(storeId: string): Promise<number> {
    const storeProducts = await db.query.products.findMany({
      where: eq(products.storeId, storeId),
      columns: { images: true },
    })

    let totalImages = 0
    for (const product of storeProducts) {
      totalImages += product.images.length
    }

    return totalImages * 2
  }
}

export const subscriptionService = new SubscriptionService()
