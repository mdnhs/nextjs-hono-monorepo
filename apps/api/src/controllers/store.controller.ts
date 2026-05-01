import { Context } from 'hono'
import { StoreStatus } from '@prisma/client'
import { BaseController } from './base.controller'
import { storeService, CreateStoreData, UpdateStoreData } from '../services/store.service'
import { subscriptionService } from '../services/subscription.service'
import { createStoreSchema, updateStoreSchema } from '../utils/validation'
import { z } from 'zod'

const upgradeSubscriptionSchema = z.object({
  planId: z.string().min(1),
})

export class StoreController extends BaseController {
  async getAllStores(c: Context) {
    try {
      const status = c.req.query('status') as StoreStatus | undefined
      const { page, limit } = this.getPaginationParams(c)
      
      const result = await storeService.getAllStores(
        { status },
        { page, limit }
      )
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getStoreById(c: Context) {
    try {
      const id = c.req.param('id')!
      const store = await storeService.getStoreById(id)
      
      return c.json(store)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getStoreBySlug(c: Context) {
    try {
      const slug = c.req.param('slug')!
      const store = await storeService.getStoreBySlug(slug)
      
      return c.json(store)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getUserStores(c: Context) {
    try {
      const user = c.get('user')
      const { page, limit } = this.getPaginationParams(c)
      
      const result = await storeService.getUserStores(
        user.userId,
        { page, limit }
      )
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async createStore(c: Context) {
    try {
      const user = c.get('user')
      const body = await c.req.json()
      const validatedData = await this.parseBody<CreateStoreData>(c, createStoreSchema)
      
      const store = await storeService.createStore({
        ...validatedData,
        planId: body.planId,
        customDomain: body.customDomain,
      }, user.userId)
      
      return c.json({
        message: 'Store created and pending approval',
        store,
      }, 201)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async updateStore(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      const validatedData = await this.parseBody<UpdateStoreData>(c, updateStoreSchema)
      
      const store = await storeService.updateStore(
        id,
        validatedData,
        user.userId,
        user.role
      )
      
      return c.json(store)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async deleteStore(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      
      const result = await storeService.deleteStore(
        id,
        user.userId,
        user.role
      )
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getStoreSubscription(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!
      
      const store = await storeService.getStoreById(storeId)
      if (store.ownerId !== user.userId && user.role !== 'ADMIN') {
        return c.json({ error: 'Not authorized' }, 403)
      }
      
      const subscription = await subscriptionService.getSubscriptionByStoreId(storeId)
      
      if (!subscription) {
        return c.json({ error: 'No subscription found' }, 404)
      }
      
      return c.json(subscription)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async cancelSubscription(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!
      
      const store = await storeService.getStoreById(storeId)
      if (store.ownerId !== user.userId && user.role !== 'ADMIN') {
        return c.json({ error: 'Not authorized' }, 403)
      }
      
      const subscription = await subscriptionService.cancelSubscription(storeId)
      
      return c.json({
        message: 'Subscription cancelled',
        subscription,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async upgradeSubscription(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!
      const { planId } = await this.parseBody(c, upgradeSubscriptionSchema)
      
      const store = await storeService.getStoreById(storeId)
      if (store.ownerId !== user.userId && user.role !== 'ADMIN') {
        return c.json({ error: 'Not authorized' }, 403)
      }
      
      const subscription = await subscriptionService.updateSubscriptionPlan(storeId, planId)
      
      return c.json({
        message: 'Subscription upgraded',
        subscription,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getStoreLimits(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!
      
      const store = await storeService.getStoreById(storeId)
      if (store.ownerId !== user.userId && user.role !== 'ADMIN') {
        return c.json({ error: 'Not authorized' }, 403)
      }
      
      const [productLimit, orderLimit] = await Promise.all([
        subscriptionService.checkPlanLimits(storeId, 'products'),
        subscriptionService.checkPlanLimits(storeId, 'orders'),
      ])
      
      return c.json({
        products: productLimit,
        orders: orderLimit,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const storeController = new StoreController()
