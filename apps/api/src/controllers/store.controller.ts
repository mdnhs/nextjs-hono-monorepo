import { Context } from 'hono'
import { BaseController } from './base.controller'
import { storeService, CreateStoreData, UpdateStoreData } from '../services/store.service'
import { subscriptionService } from '../services/subscription.service'
import { createStoreSchema, updateStoreSchema } from '../utils/validation'
import type { StoreStatus } from '../db/schema'
import { z } from 'zod'

const upgradeSubscriptionSchema = z.object({
  planId: z.string().min(1),
})

export class StoreController extends BaseController {
  async getAllStores(c: Context) {
    try {
      const user = c.get('user')
      const isAdmin = user?.role === 'ADMIN'
      
      // Public users (or non-admins) should only see APPROVED stores
      const status = isAdmin 
        ? (c.req.query('status') as StoreStatus | undefined)
        : 'APPROVED' as const
        
      const { page, limit } = this.getPaginationParams(c)
      
      const result = await storeService.getAllStores(
        { status },
        { page, limit }
      )
      
      return this.paginate(c, result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getStoreById(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      const store = await storeService.getStoreById(id)
      
      if (store.status !== 'APPROVED' && user?.role !== 'ADMIN' && store.ownerId !== user?.userId) {
        return c.json({
          data: null,
          error: true,
          message: 'Store not found or not approved'
        }, 404)
      }
      
      return this.success(c, store)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getStoreBySlug(c: Context) {
    try {
      const slug = c.req.param('slug')!
      const store = await storeService.getStoreBySlug(slug)
      
      return this.success(c, store)
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
      
      return this.paginate(c, result)
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
      
      return this.success(c, store, 'Store created and pending approval', 201)
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
      
      return this.success(c, store, 'Store updated successfully')
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
      
      return this.success(c, result, 'Store deleted successfully')
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
        return c.json({
          data: null,
          error: true,
          message: 'Not authorized'
        }, 403)
      }
      
      const subscription = await subscriptionService.getSubscriptionByStoreId(storeId)
      
      if (!subscription) {
        return c.json({
          data: null,
          error: true,
          message: 'No subscription found'
        }, 404)
      }
      
      return this.success(c, subscription)
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
        return c.json({
          data: null,
          error: true,
          message: 'Not authorized'
        }, 403)
      }
      
      const subscription = await subscriptionService.cancelSubscription(storeId)
      
      return this.success(c, subscription, 'Subscription cancelled')
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
        return c.json({
          data: null,
          error: true,
          message: 'Not authorized'
        }, 403)
      }
      
      const subscription = await subscriptionService.updateSubscriptionPlan(storeId, planId)
      
      return this.success(c, subscription, 'Subscription upgraded')
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
        return c.json({
          data: null,
          error: true,
          message: 'Not authorized'
        }, 403)
      }
      
      const [productLimit, orderLimit] = await Promise.all([
        subscriptionService.checkPlanLimits(storeId, 'products'),
        subscriptionService.checkPlanLimits(storeId, 'orders'),
      ])
      
      return this.success(c, {
        products: productLimit,
        orders: orderLimit,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const storeController = new StoreController()
