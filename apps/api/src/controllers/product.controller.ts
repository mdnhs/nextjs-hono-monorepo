import { Context } from 'hono'
import { BaseController } from './base.controller'
import { productService, CreateProductData, UpdateProductData } from '../services/product.service'
import { storeService } from '../services/store.service'
import { createProductSchema } from '../utils/validation'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  images: z.array(z.string().url()).optional(),
  sku: z.string().min(2).optional(),
  quantity: z.number().int().min(0).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional()
})

const updateInventorySchema = z.object({
  quantity: z.number().int().min(0)
})

export class ProductController extends BaseController {
  async getAllProducts(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const isActiveParam = c.req.query('isActive')
      const filters = {
        storeId: c.req.query('storeId'),
        categoryId: c.req.query('categoryId'),
        isActive: isActiveParam !== undefined ? isActiveParam === 'true' : true,
        minPrice: c.req.query('minPrice') ? parseFloat(c.req.query('minPrice')!) : undefined,
        maxPrice: c.req.query('maxPrice') ? parseFloat(c.req.query('maxPrice')!) : undefined,
        search: c.req.query('search')
      }
      
      const result = await productService.getAllProducts(filters, { page, limit })
      
      return this.paginate(c, result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getProductById(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      const product = await productService.getProductById(id)
      
      // If store is not approved, only ADMIN or store OWNER can view its products
      if (product.store.status !== 'APPROVED' && user?.role !== 'ADMIN' && product.store.ownerId !== user?.userId) {
        return c.json({
          data: null,
          error: true,
          message: 'Product not found'
        }, 404)
      }
      
      return this.success(c, product)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getProductBySku(c: Context) {
    try {
      const user = c.get('user')
      const sku = c.req.param('sku')!
      const product = await productService.getProductBySku(sku)
      
      // If store is not approved, only ADMIN or store OWNER can view its products
      if (product.store.status !== 'APPROVED' && user?.role !== 'ADMIN' && product.store.ownerId !== user?.userId) {
        return c.json({
          data: null,
          error: true,
          message: 'Product not found'
        }, 404)
      }
      
      return this.success(c, product)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getStoreProducts(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('storeId')!

      const store = await storeService.getStoreById(storeId)

      // If store is not approved, only ADMIN or store OWNER can view its products
      if (store.status !== 'APPROVED' && user?.role !== 'ADMIN' && store.ownerId !== user?.userId) {
        return c.json({
          data: null,
          error: true,
          message: 'Store not found or not approved'
        }, 404)
      }

      const { page, limit } = this.getPaginationParams(c)
      const result = await productService.getStoreProducts(storeId, { page, limit })

      return this.paginate(c, result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  
  async createProduct(c: Context) {
    try {
      const user = c.get('user')
      const body = await c.req.json()
      const storeId = c.req.param('storeId') ?? body.storeId
      
      if (!storeId) {
        return c.json({
          data: null,
          error: true,
          message: 'Store ID is required'
        }, 400)
      }
      
      const validatedData = createProductSchema.parse(body)
      
      const product = await productService.createProduct(
        storeId,
        validatedData,
        user.userId,
        user.role
      )
      
      return this.success(c, product, 'Product created successfully', 201)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async updateProduct(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      const validatedData = await this.parseBody<UpdateProductData>(c, updateProductSchema)
      
      const product = await productService.updateProduct(
        id,
        validatedData,
        user.userId,
        user.role
      )
      
      return this.success(c, product, 'Product updated successfully')
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async deleteProduct(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      
      const result = await productService.deleteProduct(
        id,
        user.userId,
        user.role
      )
      
      return this.success(c, result, 'Product deleted successfully')
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async updateInventory(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      const { quantity } = await this.parseBody<{ quantity: number }>(c, updateInventorySchema)
      
      const product = await productService.updateInventory(
        id,
        quantity,
        user.userId,
        user.role
      )
      
      return this.success(c, product, 'Inventory updated successfully')
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async toggleProductStatus(c: Context) {
    try {
      const user = c.get('user')
      const id = c.req.param('id')!
      
      const product = await productService.toggleProductStatus(
        id,
        user.userId,
        user.role
      )
      
      return this.success(c, product, `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  // Get all products owned by the authenticated seller
  async getSellerProducts(c: Context) {
    try {
      const user = c.get('user')
      const { page, limit } = this.getPaginationParams(c)
      
      // Extract query parameters for filtering
      const categoryId = c.req.query('categoryId')
      const isActive = c.req.query('isActive')
      const minPrice = c.req.query('minPrice')
      const maxPrice = c.req.query('maxPrice')
      const search = c.req.query('search')
      
      const filters = {
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(minPrice && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        ...(search && { search }),
      }
      
      const result = await productService.getSellerProducts(
        user.userId,
        filters,
        { page, limit }
      )
      
      return this.paginate(c, result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const productController = new ProductController()