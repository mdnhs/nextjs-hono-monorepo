import { prisma } from '../utils/prisma'
import { BaseService } from './base.service'
import type { Subscription, BillingCycle, SubscriptionStatus } from '@prisma/client'

export interface CreateSubscriptionData {
  storeId: string
  planId: string
  billingCycle?: 'MONTHLY' | 'YEARLY'
  trialDays?: number
}

export class SubscriptionService extends BaseService {
  async getSubscriptionByStoreId(storeId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { storeId },
      include: {
        plan: true,
      },
    })
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        store: true,
      },
    })
  }

  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const existing = await this.getSubscriptionByStoreId(data.storeId)
    if (existing) {
      throw new Error('Store already has an active subscription')
    }

    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    })

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
      status = billingCycle === 'MONTHLY' ? 'ACTIVE' : 'ACTIVE'
      currentPeriodEnd = new Date(now)
      if (billingCycle === 'MONTHLY') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
      }
    }

    return prisma.subscription.create({
      data: {
        storeId: data.storeId,
        planId: data.planId,
        billingCycle,
        status,
        currentPeriodStart: now,
        currentPeriodEnd,
      },
      include: {
        plan: true,
      },
    })
  }

  async cancelSubscription(storeId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionByStoreId(storeId)
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    return prisma.subscription.update({
      where: { storeId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        plan: true,
      },
    })
  }

  async updateSubscriptionPlan(storeId: string, newPlanId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionByStoreId(storeId)
    if (!subscription) {
      throw new Error('Subscription not found')
    }

    const newPlan = await prisma.plan.findUnique({
      where: { id: newPlanId },
    })

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

    return prisma.subscription.update({
      where: { storeId },
      data: {
        planId: newPlanId,
        currentPeriodStart: now,
        currentPeriodEnd: newPeriodEnd,
        status: 'ACTIVE',
        cancelledAt: null,
      },
      include: {
        plan: true,
      },
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

    const plan = await prisma.plan.findUnique({
      where: { id: subscription.planId },
    })

    if (!plan) {
      throw new Error('Plan not found')
    }

    let current: number
    let limit: number | null

    switch (type) {
      case 'products':
        current = await prisma.product.count({ where: { storeId } })
        limit = plan.maxProducts
        break
      case 'orders':
        current = await prisma.order.count({ where: { storeId } })
        limit = plan.maxOrders
        break
      case 'storage':
        current = await this.getStoreStorageUsed(storeId)
        limit = plan.maxStorageMB
        break
      default:
        throw new Error('Invalid limit type')
    }

    return {
      withinLimit: limit === null || current < limit,
      current,
      limit,
    }
  }

  async checkStoreLimit(userId: string): Promise<{ withinLimit: boolean; current: number; limit: number | null }> {
    const storeCount = await prisma.store.count({ where: { ownerId: userId } })
    
    // Get the plan with the highest store limit from user's subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        store: { ownerId: userId },
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
      include: {
        plan: true,
      },
    })

    // Find max store limit across all plans (null = unlimited)
    let limit: number | null = null
    for (const sub of subscriptions) {
      if (sub.plan.maxStores === null) {
        limit = null
        break
      }
      if (limit === null || sub.plan.maxStores > limit) {
        limit = sub.plan.maxStores
      }
    }

    return {
      withinLimit: limit === null || storeCount < limit,
      current: storeCount,
      limit,
    }
  }

  private async getStoreStorageUsed(storeId: string): Promise<number> {
    const products = await prisma.product.findMany({
      where: { storeId },
      select: { images: true },
    })

    // Rough estimate: assume each image URL averages ~100 bytes of metadata
    // In production, you'd track actual file sizes
    let totalImages = 0
    for (const product of products) {
      totalImages += product.images.length
    }

    // Return a placeholder - in production, integrate with S3/storage service
    return totalImages * 2 // MB estimate
  }
}

export const subscriptionService = new SubscriptionService()
