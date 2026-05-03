import { Context } from 'hono'
import { BaseController } from './base.controller'
import { storefrontAuthService } from '../services/storefront-auth.service'
import { registerSchema, loginSchema } from '../utils/validation'
import { HTTPException } from 'hono/http-exception'

export class StorefrontAuthController extends BaseController {
  async register(c: Context) {
    try {
      const tenant = c.get('tenantStore')
      if (!tenant) {
        throw new HTTPException(400, { message: 'Store context required' })
      }

      const body = await this.parseBody<any>(c, registerSchema)
      const result = await storefrontAuthService.register({
        ...body,
        storeId: tenant.id
      })
      
      return this.success(c, result, 'Registration successful', 201)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async login(c: Context) {
    try {
      const tenant = c.get('tenantStore')
      if (!tenant) {
        throw new HTTPException(400, { message: 'Store context required' })
      }

      const body = await this.parseBody<any>(c, loginSchema)
      const result = await storefrontAuthService.login({
        ...body,
        storeId: tenant.id
      })
      
      // Use a different cookie name for customers to avoid clashing with platform users
      c.header('Set-Cookie', `customer_token=${result.token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`)
      
      return this.success(c, result, 'Login successful')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getProfile(c: Context) {
    try {
      const user = c.get('user')
      if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' })
      }
      const profile = await storefrontAuthService.getProfile(user.userId)
      
      return this.success(c, profile)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async logout(c: Context) {
    // Clear the customer token cookie
    c.header('Set-Cookie', 'customer_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax')
    
    return this.success(c, null, 'Logout successful')
  }
}

export const storefrontAuthController = new StorefrontAuthController()
