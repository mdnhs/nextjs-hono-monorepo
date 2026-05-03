// TenantRepo — defense against missing storeId filter on tenant-scoped queries.
// Always injects `storeId` filter on read/write of tenant-owned tables.
// Use this in services dealing with tenant data instead of `db` directly.
//
// Usage:
//   const repo = tenantRepo(c.get('tenantStore').id)
//   await repo.products.findMany({ where: eq(products.isActive, true) })
//
// Bypass for platform admin queries: import `db` directly. Document why each time.

import type { Context } from 'hono'
import { db } from '.'
import {
  products,
  productVariants,
  orders,
  customers,
  locations,
  inventoryLevels,
  discounts,
  taxRates,
  shippingRates,
  categories,
} from './schema'
import { and, eq } from 'drizzle-orm'

const mergeWhere = (args: any, storeFilter: any): any => {
  if (!args) return { where: storeFilter }
  if (!args.where) return { ...args, where: storeFilter }
  // If user provided a function form, evaluate it minimally — for that case let them
  // call db directly; we only auto-merge SQL form.
  if (typeof args.where === 'function') {
    throw new Error('tenantRepo: function-form `where` not supported; use SQL form')
  }
  return { ...args, where: and(args.where, storeFilter) }
}

export const tenantRepo = (storeId: string) => {
  if (!storeId) throw new Error('tenantRepo: storeId required')

  return {
    storeId,

    products: {
      findMany: (args?: Parameters<typeof db.query.products.findMany>[0]) =>
        db.query.products.findMany(mergeWhere(args, eq(products.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.products.findFirst>[0]) =>
        db.query.products.findFirst(mergeWhere(args, eq(products.storeId, storeId))),
    },

    orders: {
      findMany: (args?: Parameters<typeof db.query.orders.findMany>[0]) =>
        db.query.orders.findMany(mergeWhere(args, eq(orders.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.orders.findFirst>[0]) =>
        db.query.orders.findFirst(mergeWhere(args, eq(orders.storeId, storeId))),
    },

    customers: {
      findMany: (args?: Parameters<typeof db.query.customers.findMany>[0]) =>
        db.query.customers.findMany(mergeWhere(args, eq(customers.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.customers.findFirst>[0]) =>
        db.query.customers.findFirst(mergeWhere(args, eq(customers.storeId, storeId))),
    },

    locations: {
      findMany: (args?: Parameters<typeof db.query.locations.findMany>[0]) =>
        db.query.locations.findMany(mergeWhere(args, eq(locations.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.locations.findFirst>[0]) =>
        db.query.locations.findFirst(mergeWhere(args, eq(locations.storeId, storeId))),
    },

    discounts: {
      findMany: (args?: Parameters<typeof db.query.discounts.findMany>[0]) =>
        db.query.discounts.findMany(mergeWhere(args, eq(discounts.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.discounts.findFirst>[0]) =>
        db.query.discounts.findFirst(mergeWhere(args, eq(discounts.storeId, storeId))),
    },

    taxRates: {
      findMany: (args?: Parameters<typeof db.query.taxRates.findMany>[0]) =>
        db.query.taxRates.findMany(mergeWhere(args, eq(taxRates.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.taxRates.findFirst>[0]) =>
        db.query.taxRates.findFirst(mergeWhere(args, eq(taxRates.storeId, storeId))),
    },

    shippingRates: {
      findMany: (args?: Parameters<typeof db.query.shippingRates.findMany>[0]) =>
        db.query.shippingRates.findMany(mergeWhere(args, eq(shippingRates.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.shippingRates.findFirst>[0]) =>
        db.query.shippingRates.findFirst(mergeWhere(args, eq(shippingRates.storeId, storeId))),
    },

    categories: {
      findMany: (args?: Parameters<typeof db.query.categories.findMany>[0]) =>
        db.query.categories.findMany(mergeWhere(args, eq(categories.storeId, storeId))),
      findFirst: (args?: Parameters<typeof db.query.categories.findFirst>[0]) =>
        db.query.categories.findFirst(mergeWhere(args, eq(categories.storeId, storeId))),
    },

    // Variants inherit tenant via parent. Use these asserts
    // at boundaries before mutating.
    assertProductInStore: async (productId: string) => {
      const p = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.storeId, storeId)),
        columns: { id: true },
      })
      if (!p) throw new Error('Product not in this store')
    },
    assertVariantInStore: async (variantId: string) => {
      const v = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, variantId),
        with: { product: { columns: { storeId: true } } },
      })
      if (!v || v.product.storeId !== storeId) throw new Error('Variant not in this store')
    },
    assertLocationInStore: async (locationId: string) => {
      const l = await db.query.locations.findFirst({
        where: and(eq(locations.id, locationId), eq(locations.storeId, storeId)),
        columns: { id: true },
      })
      if (!l) throw new Error('Location not in this store')
    },
  }
}

export type TenantRepo = ReturnType<typeof tenantRepo>

export const repoFromContext = (c: Context): TenantRepo | null => {
  const tenant = c.get('tenantStore')
  return tenant ? tenantRepo(tenant.id) : null
}

export const requireRepo = (c: Context): TenantRepo => {
  const repo = repoFromContext(c)
  if (!repo) throw new Error('Tenant context required for this route')
  return repo
}
