import { db } from '../db'
import { stores, subscriptions, plans, products, orders, users } from '../db/schema'
import type { StoreStatus, UserRole } from '../db/schema'
import { eq, and, ne, desc, count, sql } from 'drizzle-orm'
import { BaseService } from './base.service'
import { invalidateTenantCache } from '../middlewares/tenant'

const cacheKeysFor = (s: { slug?: string | null; customDomain?: string | null }): string[] => {
  const keys: string[] = []
  if (s.slug) keys.push(`slug:${s.slug}`)
  if (s.customDomain) keys.push(`host:${s.customDomain}`)
  return keys
}

export interface CreateStoreData {
  name: string
  description?: string
  slug: string
  logo?: string
  planId?: string
  customDomain?: string
}

export interface UpdateStoreData {
  name?: string
  description?: string
  slug?: string
  logo?: string
  status?: StoreStatus
  customDomain?: string | null
}

export interface StoreFilters {
  status?: StoreStatus
  ownerId?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export class StoreService extends BaseService {
  async getAllStores(filters: StoreFilters, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.limit

    const conditions = []
    if (filters.status) conditions.push(eq(stores.status, filters.status))
    if (filters.ownerId) conditions.push(eq(stores.ownerId, filters.ownerId))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, [{ total }]] = await Promise.all([
      db.query.stores.findMany({
        where: whereClause,
        limit: pagination.limit,
        offset: skip,
        orderBy: [desc(stores.createdAt)],
        with: {
          owner: { columns: { id: true, name: true, email: true } },
          subscriptions: { with: { plan: { columns: { id: true, name: true, slug: true, priceMonthly: true, priceYearly: true } } } },
        },
      }),
      db.select({ total: count() }).from(stores).where(whereClause),
    ])

    const storeIds = rows.map((s) => s.id)
    const productCounts = storeIds.length
      ? await db
          .select({ storeId: products.storeId, cnt: count() })
          .from(products)
          .where(sql`${products.storeId} = ANY(ARRAY[${sql.join(storeIds.map((id) => sql`${id}`), sql`, `)}]::text[])`)
          .groupBy(products.storeId)
      : []
    const countMap = new Map(productCounts.map((r) => [r.storeId, Number(r.cnt)]))

    const data = rows.map((s) => ({
      ...s,
      _count: { products: countMap.get(s.id) ?? 0 },
    }))

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / pagination.limit),
      },
    }
  }

  async getStoreById(id: string) {
    const store = await db.query.stores.findFirst({
      where: eq(stores.id, id),
      with: {
        owner: { columns: { id: true, name: true, email: true } },
        products: {
          where: eq(products.isActive, true),
          limit: 10,
          orderBy: [desc(products.createdAt)],
        },
        subscriptions: { with: { plan: true } },
      },
    })

    if (!store) {
      throw new Error('Store not found')
    }

    const [{ productCount }, { orderCount }] = await Promise.all([
      db.select({ productCount: count() }).from(products).where(eq(products.storeId, id)).then(([r]) => r),
      db.select({ orderCount: count() }).from(orders).where(eq(orders.storeId, id)).then(([r]) => r),
    ])

    return {
      ...store,
      _count: { products: Number(productCount), orders: Number(orderCount) },
    }
  }

  async getStoreBySlug(slug: string) {
    const store = await db.query.stores.findFirst({
      where: eq(stores.slug, slug),
      with: {
        owner: { columns: { id: true, name: true, email: true } },
        products: {
          where: eq(products.isActive, true),
          limit: 10,
          orderBy: [desc(products.createdAt)],
        },
      },
    })

    if (!store) {
      throw new Error('Store not found')
    }

    if (store.status !== 'APPROVED') {
      throw new Error('Store is not approved')
    }

    const [{ productCount }, { orderCount }] = await Promise.all([
      db.select({ productCount: count() }).from(products).where(eq(products.storeId, store.id)).then(([r]) => r),
      db.select({ orderCount: count() }).from(orders).where(eq(orders.storeId, store.id)).then(([r]) => r),
    ])

    return {
      ...store,
      _count: { products: Number(productCount), orders: Number(orderCount) },
    }
  }

  async getUserStores(userId: string, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.limit

    const [rows, [{ total }]] = await Promise.all([
      db.query.stores.findMany({
        where: eq(stores.ownerId, userId),
        limit: pagination.limit,
        offset: skip,
        orderBy: [desc(stores.createdAt)],
        with: {
          subscriptions: { with: { plan: { columns: { id: true, name: true, slug: true, priceMonthly: true, priceYearly: true } } } },
        },
      }),
      db.select({ total: count() }).from(stores).where(eq(stores.ownerId, userId)),
    ])

    const storeIds = rows.map((s) => s.id)

    let productCounts: { storeId: string; cnt: typeof count }[] = []
    let orderCounts: { storeId: string; cnt: typeof count }[] = []

    if (storeIds.length > 0) {
      const idList = sql`(${sql.join(storeIds.map((id) => sql`${id}`), sql`, `)})`
      ;[productCounts, orderCounts] = await Promise.all([
        db
          .select({ storeId: products.storeId, cnt: count() })
          .from(products)
          .where(sql`${products.storeId} IN ${idList}`)
          .groupBy(products.storeId) as any,
        db
          .select({ storeId: orders.storeId, cnt: count() })
          .from(orders)
          .where(sql`${orders.storeId} IN ${idList}`)
          .groupBy(orders.storeId) as any,
      ])
    }

    const productMap = new Map((productCounts as any[]).map((r) => [r.storeId, Number(r.cnt)]))
    const orderMap = new Map((orderCounts as any[]).map((r) => [r.storeId, Number(r.cnt)]))

    const data = rows.map((s) => ({
      ...s,
      _count: { products: productMap.get(s.id) ?? 0, orders: orderMap.get(s.id) ?? 0 },
    }))

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / pagination.limit),
      },
    }
  }

  async createStore(data: CreateStoreData, ownerId: string) {
    const existingSlug = await db.query.stores.findFirst({ where: eq(stores.slug, data.slug) })
    if (existingSlug) {
      throw new Error('Slug already exists')
    }

    if (data.customDomain) {
      if (!data.planId) {
        throw new Error('A plan with custom domain feature is required to set a custom domain')
      }

      const plan = await db.query.plans.findFirst({ where: eq(plans.id, data.planId) })
      if (!plan) {
        throw new Error('Plan not found')
      }
      if (!plan.customDomain) {
        throw new Error(`Plan "${plan.name}" does not include custom domain feature. Upgrade to Pro or Enterprise.`)
      }

      const existingDomain = await db.query.stores.findFirst({
        where: eq(stores.customDomain, data.customDomain),
      })
      if (existingDomain) {
        throw new Error('Custom domain already in use')
      }
    }

    return db.transaction(async (tx) => {
      const [newStore] = await tx
        .insert(stores)
        .values({
          name: data.name,
          description: data.description,
          slug: data.slug,
          logo: data.logo,
          ownerId,
          status: 'PENDING',
          customDomain: data.customDomain || null,
        })
        .returning()

      if (data.planId) {
        const plan = await tx.query.plans.findFirst({ where: eq(plans.id, data.planId) })
        if (plan) {
          const now = new Date()
          let currentPeriodEnd = new Date(now)
          let status: 'TRIAL' | 'ACTIVE' = 'TRIAL'

          if (plan.trialDays > 0) {
            currentPeriodEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
          } else {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
            status = 'ACTIVE'
          }

          await tx.insert(subscriptions).values({
            storeId: newStore.id,
            planId: plan.id,
            billingCycle: 'MONTHLY',
            status,
            currentPeriodStart: now,
            currentPeriodEnd,
          })
        }
      }

      const owner = await tx.query.users.findFirst({
        where: eq(users.id, ownerId),
        columns: { id: true, name: true, email: true },
      })

      return { ...newStore, owner }
    })
  }

  async updateStore(id: string, data: UpdateStoreData, userId: string, userRole: UserRole) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) })

    if (!store) {
      throw new Error('Store not found')
    }

    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to update this store')
    }

    if (data.slug) {
      const existing = await db.query.stores.findFirst({
        where: and(eq(stores.slug, data.slug), ne(stores.id, id)),
      })
      if (existing) {
        throw new Error('Slug already exists')
      }
    }

    if (data.customDomain) {
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.storeId, id),
        with: { plan: true },
      })
      if (!subscription) {
        throw new Error('A plan with custom domain feature is required to set a custom domain')
      }
      if (!subscription.plan.customDomain) {
        throw new Error(`Plan "${subscription.plan.name}" does not include custom domain feature. Upgrade to Pro or Enterprise.`)
      }

      const existing = await db.query.stores.findFirst({
        where: and(eq(stores.customDomain, data.customDomain), ne(stores.id, id)),
      })
      if (existing) {
        throw new Error('Custom domain already in use')
      }
    }

    const [updated] = await db.update(stores).set(data as any).where(eq(stores.id, id)).returning()

    // Invalidate tenant cache for old + new slug/domain
    for (const key of cacheKeysFor(store)) invalidateTenantCache(key)
    for (const key of cacheKeysFor(updated)) invalidateTenantCache(key)

    const owner = await db.query.users.findFirst({
      where: eq(users.id, updated.ownerId),
      columns: { id: true, name: true, email: true },
    })

    return { ...updated, owner }
  }

  async deleteStore(id: string, userId: string, userRole: UserRole) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) })

    if (!store) {
      throw new Error('Store not found')
    }

    if (store.ownerId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to delete this store')
    }

    await db.delete(stores).where(eq(stores.id, id))
    for (const key of cacheKeysFor(store)) invalidateTenantCache(key)

    return { message: 'Store deleted successfully' }
  }

  async approveStore(id: string, _adminId: string) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) })

    if (!store) {
      throw new Error('Store not found')
    }

    if (store.status === 'APPROVED') {
      throw new Error('Store is already approved')
    }

    const [updated] = await db
      .update(stores)
      .set({ status: 'APPROVED' })
      .where(eq(stores.id, id))
      .returning()

    for (const key of cacheKeysFor(updated)) invalidateTenantCache(key)

    const owner = await db.query.users.findFirst({
      where: eq(users.id, updated.ownerId),
      columns: { id: true, name: true, email: true },
    })

    return { ...updated, owner }
  }

  async rejectStore(id: string, _adminId: string) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) })

    if (!store) {
      throw new Error('Store not found')
    }

    const [updated] = await db
      .update(stores)
      .set({ status: 'REJECTED' })
      .where(eq(stores.id, id))
      .returning()

    for (const key of cacheKeysFor(updated)) invalidateTenantCache(key)

    const owner = await db.query.users.findFirst({
      where: eq(users.id, updated.ownerId),
      columns: { id: true, name: true, email: true },
    })

    return { ...updated, owner }
  }

  async suspendStore(id: string, _adminId: string) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) })

    if (!store) {
      throw new Error('Store not found')
    }

    const [updated] = await db
      .update(stores)
      .set({ status: 'SUSPENDED' })
      .where(eq(stores.id, id))
      .returning()

    for (const key of cacheKeysFor(updated)) invalidateTenantCache(key)

    const owner = await db.query.users.findFirst({
      where: eq(users.id, updated.ownerId),
      columns: { id: true, name: true, email: true },
    })

    return { ...updated, owner }
  }
}

export const storeService = new StoreService()
