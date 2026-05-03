import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db'
import { stores, products, orders, reviews, storeStaffs } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { UserRole } from '../db/schema'

export const PERMISSIONS = {
  // SaaS platform admin
  PLATFORM_DASHBOARD: 'platform:dashboard',
  PLATFORM_STORES_READ: 'platform:stores:read',
  PLATFORM_STORES_MANAGE: 'platform:stores:manage',
  PLATFORM_USERS_READ: 'platform:users:read',
  PLATFORM_USERS_MANAGE: 'platform:users:manage',
  PLATFORM_PLANS_MANAGE: 'platform:plans:manage',
  PLATFORM_SUBSCRIPTIONS_READ: 'platform:subscriptions:read',
  PLATFORM_SUBSCRIPTIONS_MANAGE: 'platform:subscriptions:manage',
  PLATFORM_ORDERS_READ: 'platform:orders:read',

  // Seller panel (scoped to own stores)
  SELLER_DASHBOARD: 'seller:dashboard',
  SELLER_STORES_MANAGE: 'seller:stores:manage',
  SELLER_PRODUCTS_MANAGE: 'seller:products:manage',
  SELLER_ORDERS_MANAGE: 'seller:orders:manage',
  SELLER_SUBSCRIPTION_MANAGE: 'seller:subscription:manage',
  SELLER_ANALYTICS: 'seller:analytics',

  // Buyer
  BUYER_CART: 'buyer:cart',
  BUYER_ORDERS: 'buyer:orders',
  BUYER_REVIEWS: 'buyer:reviews',

  // Store Staff specific
  STORE_THEME_MANAGE: 'store:theme:manage',
  STORE_PAGES_MANAGE: 'store:pages:manage',
  STORE_NAV_MANAGE: 'store:nav:manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS) as Permission[],
  SELLER: [
    PERMISSIONS.SELLER_DASHBOARD,
    PERMISSIONS.SELLER_STORES_MANAGE,
    PERMISSIONS.SELLER_PRODUCTS_MANAGE,
    PERMISSIONS.SELLER_ORDERS_MANAGE,
    PERMISSIONS.SELLER_SUBSCRIPTION_MANAGE,
    PERMISSIONS.SELLER_ANALYTICS,
    PERMISSIONS.BUYER_CART,
    PERMISSIONS.BUYER_ORDERS,
    PERMISSIONS.BUYER_REVIEWS,
    PERMISSIONS.STORE_THEME_MANAGE,
    PERMISSIONS.STORE_PAGES_MANAGE,
    PERMISSIONS.STORE_NAV_MANAGE,
  ],
  BUYER: [
    PERMISSIONS.BUYER_CART,
    PERMISSIONS.BUYER_ORDERS,
    PERMISSIONS.BUYER_REVIEWS,
  ],
}

// Map StoreStaff roles to granular permissions
const STAFF_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  MANAGER: [
    PERMISSIONS.SELLER_DASHBOARD,
    PERMISSIONS.SELLER_PRODUCTS_MANAGE,
    PERMISSIONS.SELLER_ORDERS_MANAGE,
    PERMISSIONS.SELLER_ANALYTICS,
    PERMISSIONS.STORE_THEME_MANAGE,
    PERMISSIONS.STORE_PAGES_MANAGE,
    PERMISSIONS.STORE_NAV_MANAGE,
  ],
  EDITOR: [
    PERMISSIONS.SELLER_DASHBOARD,
    PERMISSIONS.SELLER_PRODUCTS_MANAGE,
    PERMISSIONS.STORE_THEME_MANAGE,
    PERMISSIONS.STORE_PAGES_MANAGE,
    PERMISSIONS.STORE_NAV_MANAGE,
  ],
  SUPPORT: [
    PERMISSIONS.SELLER_DASHBOARD,
    PERMISSIONS.SELLER_ORDERS_MANAGE,
  ],
}

export const hasPermission = (role: UserRole, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role]?.includes(permission) ?? false

export const requirePermission = (...permissions: Permission[]) =>
  async (c: Context, next: Next) => {
    const user = c.get('user')
    if (!user) throw new HTTPException(401, { message: 'Unauthorized' })
    
    // Check global role first
    const hasGlobal = permissions.every((p) => hasPermission(user.role, p))
    if (hasGlobal) return next()

    // If no global permission, check if they are staff for the specific store
    const storeId = c.req.param('storeId') ?? c.req.param('id')
    if (storeId) {
      const staff = await db.query.storeStaffs.findFirst({
        where: and(eq(storeStaffs.storeId, storeId), eq(storeStaffs.userId, user.userId))
      })
      if (staff) {
        const staffPerms = STAFF_ROLE_PERMISSIONS[staff.role] ?? []
        const hasStaffPerm = permissions.every(p => staffPerms.includes(p))
        if (hasStaffPerm) return next()
      }
    }

    throw new HTTPException(403, { message: 'Insufficient permissions' })
  }

// Verifies the authenticated user is OWNER or STAFF of the store.
export const requireStoreAccess = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (user.role === 'ADMIN') return next()

  const storeId = c.req.param('storeId') ?? c.req.param('id')
  if (!storeId) throw new HTTPException(400, { message: 'Store ID required' })

  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    columns: { id: true, ownerId: true },
  })

  if (!store) throw new HTTPException(404, { message: 'Store not found' })
  
  // Check ownership
  if (store.ownerId === user.userId) return next()

  // Check staff status
  const staff = await db.query.storeStaffs.findFirst({
    where: and(eq(storeStaffs.storeId, storeId), eq(storeStaffs.userId, user.userId))
  })

  if (!staff) {
    throw new HTTPException(403, { message: 'Access denied: no relation to this store' })
  }

  await next()
}

// requireStoreOwnership renamed to requireStoreAccess for better semantics including staff
export const requireStoreOwnership = requireStoreAccess


// Verifies the authenticated seller owns the product identified by :id param.
// ADMIN bypasses this check.
export const requireProductOwnership = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (user.role === 'ADMIN') return next()

  const productId = c.req.param('id')
  if (!productId) throw new HTTPException(400, { message: 'Product ID required' })

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true, storeId: true },
    with: {
      store: {
        columns: { ownerId: true },
      },
    },
  })

  if (!product) throw new HTTPException(404, { message: 'Product not found' })
  if (product.store.ownerId !== user.userId) {
    throw new HTTPException(403, { message: 'Access denied: not your product' })
  }

  await next()
}

// Verifies the authenticated seller owns the store that the order belongs to.
// Also allows the BUYER who placed the order to access it.
// ADMIN bypasses this check.
export const requireOrderOwnership = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (user.role === 'ADMIN') return next()

  const orderId = c.req.param('id')
  if (!orderId) throw new HTTPException(400, { message: 'Order ID required' })

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    columns: { id: true, userId: true, storeId: true },
    with: {
      store: {
        columns: { ownerId: true },
      },
    },
  })

  if (!order) throw new HTTPException(404, { message: 'Order not found' })

  const isBuyerOwner = order.userId === user.userId
  const isSellerOwner = order.store.ownerId === user.userId

  if (!isBuyerOwner && !isSellerOwner) {
    throw new HTTPException(403, { message: 'Access denied: not your order' })
  }

  await next()
}

// Verifies the authenticated user owns the review identified by :id param.
// ADMIN bypasses this check.
export const requireReviewOwnership = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (user.role === 'ADMIN') return next()

  const reviewId = c.req.param('id')
  if (!reviewId) throw new HTTPException(400, { message: 'Review ID required' })

  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    columns: { id: true, userId: true },
  })

  if (!review) throw new HTTPException(404, { message: 'Review not found' })
  if (review.userId !== user.userId) {
    throw new HTTPException(403, { message: 'Access denied: not your review' })
  }

  await next()
}
