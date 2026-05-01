import { Context } from 'hono'
import { StoreStatus } from '@prisma/client'
import { BaseController } from './base.controller'
import { storeService, CreateStoreData, UpdateStoreData } from '../services/store.service'
import { createStoreSchema, updateStoreSchema } from '../utils/validation'

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
      const validatedData = await this.parseBody<CreateStoreData>(c, createStoreSchema)
      
      const store = await storeService.createStore(validatedData, user.userId)
      
      return c.json(store, 201)
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
  
  async publishStore(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      
      const store = await storeService.publishStore(
        id,
        user.userId,
        user.role
      )
      
      return c.json({
        message: 'Store published successfully',
        store
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async unpublishStore(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      
      const store = await storeService.unpublishStore(
        id,
        user.userId,
        user.role
      )
      
      return c.json({
        message: 'Store unpublished successfully',
        store
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const storeController = new StoreController()