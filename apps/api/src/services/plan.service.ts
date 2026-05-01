import { prisma } from '../utils/prisma'
import { BaseService } from './base.service'
import type { Plan, Prisma } from '@prisma/client'

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
  async getAllPlans(): Promise<Plan[]> {
    return prisma.plan.findMany({
      orderBy: { priceMonthly: 'asc' },
    })
  }

  async getActivePlans(): Promise<Plan[]> {
    return prisma.plan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priceMonthly: 'asc' },
    })
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return prisma.plan.findUnique({
      where: { id },
    })
  }

  async getPlanBySlug(slug: string): Promise<Plan | null> {
    return prisma.plan.findUnique({
      where: { slug },
    })
  }

  async createPlan(data: CreatePlanData): Promise<Plan> {
    return prisma.plan.create({
      data: {
        ...data,
        features: data.features as Prisma.JsonObject,
      },
    })
  }

  async updatePlan(id: string, data: UpdatePlanData): Promise<Plan> {
    const plan = await this.getPlanById(id)
    if (!plan) {
      throw new Error('Plan not found')
    }

    const { features, ...rest } = data
    const updateData: Prisma.PlanUpdateInput = rest
    if (features !== undefined) {
      updateData.features = features as unknown as Prisma.InputJsonValue
    }

    return prisma.plan.update({
      where: { id },
      data: updateData,
    })
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.getPlanById(id)
    if (!plan) {
      throw new Error('Plan not found')
    }

    const subscriptionCount = await prisma.subscription.count({
      where: { planId: id },
    })

    if (subscriptionCount > 0) {
      throw new Error('Cannot delete plan with active subscriptions')
    }

    await prisma.plan.delete({
      where: { id },
    })
  }
}

export const planService = new PlanService()
