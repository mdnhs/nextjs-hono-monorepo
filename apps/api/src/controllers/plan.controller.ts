import { Context } from 'hono'
import { BaseController } from './base.controller'
import { planService, CreatePlanData, UpdatePlanData } from '../services/plan.service'
import { z } from 'zod'

const createPlanSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  priceMonthly: z.number().min(0),
  priceYearly: z.number().min(0),
  trialDays: z.number().int().min(0).optional(),
  maxStores: z.number().int().min(1).optional(),
  maxProducts: z.number().int().min(1).optional(),
  maxOrders: z.number().int().min(1).optional(),
  maxStorageMB: z.number().int().min(1).optional(),
  customDomain: z.boolean().optional(),
  analytics: z.boolean().optional(),
  prioritySupport: z.boolean().optional(),
  removeBranding: z.boolean().optional(),
  apiAccess: z.boolean().optional(),
  features: z.record(z.string(), z.unknown()).optional(),
})

const updatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  priceMonthly: z.number().min(0).optional(),
  priceYearly: z.number().min(0).optional(),
  trialDays: z.number().int().min(0).optional(),
  maxStores: z.number().int().min(1).nullable().optional(),
  maxProducts: z.number().int().min(1).nullable().optional(),
  maxOrders: z.number().int().min(1).nullable().optional(),
  maxStorageMB: z.number().int().min(1).optional(),
  customDomain: z.boolean().optional(),
  analytics: z.boolean().optional(),
  prioritySupport: z.boolean().optional(),
  removeBranding: z.boolean().optional(),
  apiAccess: z.boolean().optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['ACTIVE', 'HIDDEN']).optional(),
})

export class PlanController extends BaseController {
  async getAllPlans(c: Context) {
    try {
      const plans = await planService.getAllPlans()
      return this.success(c, plans)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getActivePlans(c: Context) {
    try {
      const plans = await planService.getActivePlans()
      return this.success(c, plans)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getPlanById(c: Context) {
    try {
      const id = c.req.param('id')!
      const plan = await planService.getPlanById(id)
      if (!plan) {
        return c.json({
          data: null,
          error: true,
          message: 'Plan not found'
        }, 404)
      }
      return this.success(c, plan)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async createPlan(c: Context) {
    try {
      const validatedData = await this.parseBody<CreatePlanData>(c, createPlanSchema)
      const plan = await planService.createPlan(validatedData)
      return this.success(c, plan, 'Plan created successfully', 201)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async updatePlan(c: Context) {
    try {
      const id = c.req.param('id')!
      const validatedData = await this.parseBody<UpdatePlanData>(c, updatePlanSchema)
      const plan = await planService.updatePlan(id, validatedData)
      return this.success(c, plan, 'Plan updated successfully')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async deletePlan(c: Context) {
    try {
      const id = c.req.param('id')!
      await planService.deletePlan(id)
      return this.success(c, null, 'Plan deleted successfully')
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const planController = new PlanController()
