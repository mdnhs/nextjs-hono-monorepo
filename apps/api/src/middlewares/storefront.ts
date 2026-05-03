import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getCookie } from 'hono/cookie'
import {
  CART_TOKEN_COOKIE,
  CUSTOMER_TOKEN_COOKIE,
  verifyCustomerToken,
  type CustomerJWTPayload,
} from '../utils/customer-auth'
import type { TenantStore } from './tenant'

export interface CartIdentity {
  storeId: string
  customerId: string | null
  cartToken: string | null
}

declare module 'hono' {
  interface ContextVariableMap {
    customer: CustomerJWTPayload | null
    cartIdentity: CartIdentity
  }
}

// Resolves cart identity from customer JWT (preferred) or guest cart_token cookie.
// Requires resolveTenant to have run upstream — c.get('tenantStore') must be set.
export const resolveCartIdentity = async (c: Context, next: Next) => {
  const tenant = c.get('tenantStore') as TenantStore | null
  if (!tenant) {
    throw new HTTPException(400, { message: 'Storefront context required' })
  }

  let customer: CustomerJWTPayload | null = null
  const auth = c.req.header('Authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined
  const customerCookie = getCookie(c, CUSTOMER_TOKEN_COOKIE)
  const token = bearer ?? customerCookie

  if (token) {
    try {
      const payload = verifyCustomerToken(token)
      if (payload.storeId === tenant.id) customer = payload
    } catch {
      // Ignore — fall through to guest path.
    }
  }

  const cartToken = customer ? null : (getCookie(c, CART_TOKEN_COOKIE) ?? null)

  c.set('customer', customer)
  c.set('cartIdentity', {
    storeId: tenant.id,
    customerId: customer?.customerId ?? null,
    cartToken,
  })

  return next()
}

// Hard-requires a customer (no guest fallback).
export const requireCustomer = async (c: Context, next: Next) => {
  if (!c.get('customer')) {
    throw new HTTPException(401, { message: 'Customer authentication required' })
  }
  return next()
}
