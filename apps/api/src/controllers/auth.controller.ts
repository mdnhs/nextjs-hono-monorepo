import { Context } from 'hono'
import { BaseController } from './base.controller'
import { authService, RegisterData, LoginData } from '../services/auth.service'
import { registerSchema, loginSchema } from '../utils/validation'

export class AuthController extends BaseController {
  async register(c: Context) {
    try {
      const validatedData = await this.parseBody<RegisterData>(c, registerSchema)
      const result = await authService.register(validatedData)
      
      return c.json({
        message: 'User registered successfully',
        ...result
      }, 201)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async login(c: Context) {
    try {
      const validatedData = await this.parseBody<LoginData>(c, loginSchema)
      const result = await authService.login(validatedData)
      
      // Set JWT token as httpOnly cookie for security
      c.header('Set-Cookie', `token=${result.token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`)
      
      return c.json({
        message: 'Login successful',
        ...result
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getProfile(c: Context) {
    try {
      const user = c.get('user')
      const profile = await authService.getCurrentUser(user.userId)
      
      return c.json(profile)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async logout(c: Context) {
    // Clear the JWT cookie
    c.header('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax')
    
    return c.json({
      message: 'Logout successful'
    })
  }
}

export const authController = new AuthController()