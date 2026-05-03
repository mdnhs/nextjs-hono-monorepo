import { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { z } from 'zod'
import { BaseController } from './base.controller'
import { cartService, type AddToCartData, type UpdateCartItemData } from '../services/cart.service'
import { CART_TOKEN_COOKIE } from '../utils/customer-auth'
import type { CartIdentity } from '../middlewares/storefront'

const addSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
})

const updateSchema = z.object({
  quantity: z.number().int().min(0),
})

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export class StorefrontCartController extends BaseController {
  private writeCartTokenCookie(c: Context, token?: string) {
    if (token) setCookie(c, CART_TOKEN_COOKIE, token, COOKIE_OPTS)
  }

  async getCart(c: Context) {
    try {
      const identity = c.get('cartIdentity') as CartIdentity
      const result = await cartService.getCart(identity)
      this.writeCartTokenCookie(c, result.newCartToken)
      return this.success(c, result.cart)
    } catch (e: any) {
      return this.handleError(e)
    }
  }

  async addToCart(c: Context) {
    try {
      const identity = c.get('cartIdentity') as CartIdentity
      const body = await this.parseBody<AddToCartData>(c, addSchema)
      const result = await cartService.addToCart(identity, body)
      this.writeCartTokenCookie(c, result.newCartToken)
      return this.success(c, result.cart, 'Item added')
    } catch (e: any) {
      return this.handleError(e)
    }
  }

  async updateItem(c: Context) {
    try {
      const identity = c.get('cartIdentity') as CartIdentity
      const id = c.req.param('itemId')!
      const body = await this.parseBody<UpdateCartItemData>(c, updateSchema)
      const result = await cartService.updateCartItem(identity, id, body)
      return this.success(c, result.cart, body.quantity === 0 ? 'Item removed' : 'Item updated')
    } catch (e: any) {
      return this.handleError(e)
    }
  }

  async removeItem(c: Context) {
    try {
      const identity = c.get('cartIdentity') as CartIdentity
      const id = c.req.param('itemId')!
      const result = await cartService.removeFromCart(identity, id)
      return this.success(c, result.cart, 'Item removed')
    } catch (e: any) {
      return this.handleError(e)
    }
  }

  async clear(c: Context) {
    try {
      const identity = c.get('cartIdentity') as CartIdentity
      const result = await cartService.clearCart(identity)
      return this.success(c, result.cart, 'Cart cleared')
    } catch (e: any) {
      return this.handleError(e)
    }
  }
}

export const storefrontCartController = new StorefrontCartController()
