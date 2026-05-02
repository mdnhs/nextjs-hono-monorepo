import { db } from '../db'
import { plans, subscriptions } from '../db/schema'
import { BaseService } from './base.service'
import { eq, asc, count } from 'drizzle-orm'

export interface CreatePlanData {
  name: string
  slug: string
  description?: string
  priceMonthly: number
  priceYearly: number
  trialDays?: number
  maxStores?: number
  maxProducts?: number
  maxOrders?: number
  maxStorageMB?: number
  customDomain?: boolean
  analytics?: boolean
  prioritySupport?: boolean
  removeBranding?: boolean
  apiAccess?: boolean
  features?: Record<string, unknown>
}

export interface UpdatePlanData {
  name?: string
  description?: string
  priceMonthly?: number
  priceYearly?: number
  trialDays?: number
  maxStores?: number | null
  maxProducts?: number | null
  maxOrders?: number | null
  maxStorageMB?: number
  customDomain?: boolean
  analytics?: boolean
  prioritySupport?: boolean
  removeBranding?: boolean
  apiAccess?: boolean
  features?: Record<string, unknown>
  status?: 'ACTIVE' | 'HIDDEN'
}

export class PlanService extends BaseService {
  async getAllPlans() {
    return db.select().from(plans).orderBy(asc(plans.priceMonthly))
  }

  async getActivePlans() {
    return db.query.plans.findMany({
      where: eq(plans.status, 'ACTIVE'),
      orderBy: [asc(plans.priceMonthly)],
    })
  }

  async getPlanById(id: string) {
    return db.query.plans.findFirst({ where: eq(plans.id, id) }) ?? null
  }

  async getPlanBySlug(slug: string) {
    return db.query.plans.findFirst({ where: eq(plans.slug, slug) }) ?? null
  }

  async createPlan(data: CreatePlanData) {
    const [plan] = await db
      .insert(plans)
      .values({
        ...data,
        priceMonthly: String(data.priceMonthly),
        priceYearly: String(data.priceYearly),
        features: (data.features as any) ?? {},
      })
      .returning()
    return plan
  }

  async updatePlan(id: string, data: UpdatePlanData) {
    const existing = await this.getPlanById(id)
    if (!existing) {
      throw new Error('Plan not found')
    }

    const updateData: Record<string, unknown> = { ...data }
    if (data.priceMonthly !== undefined) updateData.priceMonthly = String(data.priceMonthly)
    if (data.priceYearly !== undefined) updateData.priceYearly = String(data.priceYearly)

    const [plan] = await db.update(plans).set(updateData as any).where(eq(plans.id, id)).returning()
    return plan
  }

  async deletePlan(id: string) {
    const existing = await this.getPlanById(id)
    if (!existing) {
      throw new Error('Plan not found')
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(subscriptions)
      .where(eq(subscriptions.planId, id))

    if (Number(total) > 0) {
      throw new Error('Cannot delete plan with active subscriptions')
    }

    await db.delete(plans).where(eq(plans.id, id))
  }
}

export const planService = new PlanService()
