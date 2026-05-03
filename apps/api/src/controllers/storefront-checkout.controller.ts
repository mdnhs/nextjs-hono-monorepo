import { Context } from 'hono'
import { z } from 'zod'
import { BaseController } from './base.controller'
import { orderService, type CreateOrderData } from '../services/order.service'
import type { CartIdentity } from '../middlewares/storefront'

const checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(1),
  }),
  discountCode: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  guestEmail: z.string().email().optional(),
  guestName: z.string().min(1).optional(),
  guestPhone: z.string().min(1).optional(),
})

export class StorefrontCheckoutController extends BaseController {
  async checkout(c: Context) {
    try {
      const identity = c.get('cartIdentity') as CartIdentity
      const body = await this.parseBody<CreateOrderData>(c, checkoutSchema)

      // Guest checkout requires guestEmail (server-validates again to keep contract close).
      if (!identity.customerId && !body.guestEmail) {
        return this.success(c, null, 'Guest email required', 400)
      }

      const order = await orderService.createOrderFromCart(identity, body)
      return this.success(c, order, 'Order created', 201)
    } catch (e: any) {
      return this.handleError(e)
    }
  }
}

export const storefrontCheckoutController = new StorefrontCheckoutController()
