import { Context } from 'hono'
import { BaseController } from './base.controller'
import { db } from '../db'
import { stores, products, orders } from '../db/schema'
import { eq, and, ne, desc, count, sum, sql, inArray } from 'drizzle-orm'
import type { OrderStatus } from '../db/schema'

const EMPTY_DASHBOARD = {
  stores: { total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0, list: [] },
  products: { total: 0, active: 0 },
  orders: { total: 0, pending: 0, processing: 0, revenue: 0 },
  recentOrders: [],
}

export class SellerController extends BaseController {
  async getDashboard(c: Context) {
    try {
      const user = c.get('user')

      const sellerStores = await db.query.stores.findMany({
        where: eq(stores.ownerId, user.userId),
        columns: { id: true, name: true, slug: true, status: true, customDomain: true, createdAt: true },
        with: {
          subscriptions: {
            with: { plan: { columns: { id: true, name: true, slug: true } } },
          },
        },
      })

      if (sellerStores.length === 0) return c.json(EMPTY_DASHBOARD)

      const storeIds = sellerStores.map((s) => s.id)

      const [productStats, orderStats, revenueResult, recentOrders] = await Promise.all([
        db
          .select({
            total: count(),
            active: sql<number>`cast(sum(case when ${products.isActive} then 1 else 0 end) as int)`,
          })
          .from(products)
          .where(inArray(products.storeId, storeIds)),

        db
          .select({
            total: count(),
            pending: sql<number>`cast(sum(case when ${orders.status} = 'PENDING' then 1 else 0 end) as int)`,
            processing: sql<number>`cast(sum(case when ${orders.status} = 'PROCESSING' then 1 else 0 end) as int)`,
          })
          .from(orders)
          .where(inArray(orders.storeId, storeIds)),

        db
          .select({ revenue: sum(orders.total) })
          .from(orders)
          .where(and(inArray(orders.storeId, storeIds), ne(orders.status, 'CANCELLED'))),

        db.query.orders.findMany({
          where: inArray(orders.storeId, storeIds),
          limit: 10,
          orderBy: [desc(orders.createdAt)],
          columns: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
          with: {
            store: { columns: { id: true, name: true, slug: true } },
            user: { columns: { id: true, name: true, email: true } },
          },
        }),
      ])

      const statusCount = sellerStores.reduce(
        (acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc },
        {} as Record<string, number>
      )

      return c.json({
        stores: {
          total: sellerStores.length,
          approved: statusCount['APPROVED'] ?? 0,
          pending: statusCount['PENDING'] ?? 0,
          rejected: statusCount['REJECTED'] ?? 0,
          suspended: statusCount['SUSPENDED'] ?? 0,
          list: sellerStores,
        },
        products: {
          total: Number(productStats[0]?.total ?? 0),
          active: Number(productStats[0]?.active ?? 0),
        },
        orders: {
          total: Number(orderStats[0]?.total ?? 0),
          pending: Number(orderStats[0]?.pending ?? 0),
          processing: Number(orderStats[0]?.processing ?? 0),
          revenue: revenueResult[0]?.revenue ? Number(revenueResult[0].revenue) : 0,
        },
        recentOrders,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getStoreDashboard(c: Context) {
    try {
      const storeId = c.req.param('storeId')!

      const store = await db.query.stores.findFirst({
        where: eq(stores.id, storeId),
        with: {
          subscriptions: { with: { plan: true } },
        },
      })

      if (!store) return c.json({ error: 'Store not found' }, 404)

      const [productStats, orderStats, revenueResult, recentOrders] = await Promise.all([
        db
          .select({
            total: count(),
            active: sql<number>`cast(sum(case when ${products.isActive} then 1 else 0 end) as int)`,
          })
          .from(products)
          .where(eq(products.storeId, storeId)),

        db
          .select({
            total: count(),
            pending: sql<number>`cast(sum(case when ${orders.status} = 'PENDING' then 1 else 0 end) as int)`,
            processing: sql<number>`cast(sum(case when ${orders.status} = 'PROCESSING' then 1 else 0 end) as int)`,
            delivered: sql<number>`cast(sum(case when ${orders.status} = 'DELIVERED' then 1 else 0 end) as int)`,
          })
          .from(orders)
          .where(eq(orders.storeId, storeId)),

        db
          .select({ revenue: sum(orders.total) })
          .from(orders)
          .where(and(eq(orders.storeId, storeId), ne(orders.status, 'CANCELLED'))),

        db.query.orders.findMany({
          where: eq(orders.storeId, storeId),
          limit: 10,
          orderBy: [desc(orders.createdAt)],
          columns: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
          with: {
            user: { columns: { id: true, name: true, email: true } },
            items: {
              with: { product: { columns: { id: true, name: true, price: true } } },
            },
          },
        }),
      ])

      return c.json({
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          status: store.status,
          customDomain: store.customDomain,
          subscription: store.subscriptions[0] ?? null,
        },
        products: {
          total: Number(productStats[0]?.total ?? 0),
          active: Number(productStats[0]?.active ?? 0),
        },
        orders: {
          total: Number(orderStats[0]?.total ?? 0),
          pending: Number(orderStats[0]?.pending ?? 0),
          processing: Number(orderStats[0]?.processing ?? 0),
          delivered: Number(orderStats[0]?.delivered ?? 0),
          revenue: revenueResult[0]?.revenue ? Number(revenueResult[0].revenue) : 0,
        },
        recentOrders,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getStoreOrders(c: Context) {
    try {
      const storeId = c.req.param('storeId')!
      const { page, limit } = this.getPaginationParams(c)
      const status = c.req.query('status') as OrderStatus | undefined
      const skip = (page - 1) * limit

      const whereClause = status
        ? and(eq(orders.storeId, storeId), eq(orders.status, status))
        : eq(orders.storeId, storeId)

      const [rows, [{ total }]] = await Promise.all([
        db.query.orders.findMany({
          where: whereClause,
          limit,
          offset: skip,
          orderBy: [desc(orders.createdAt)],
          with: {
            user: { columns: { id: true, name: true, email: true } },
            items: {
              with: { product: { columns: { id: true, name: true, price: true, images: true } } },
            },
            shippingAddress: true,
          },
        }),
        db.select({ total: count() }).from(orders).where(whereClause),
      ])

      return c.json({
        data: rows,
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getStoreProducts(c: Context) {
    try {
      const storeId = c.req.param('storeId')!
      const { page, limit } = this.getPaginationParams(c)
      const skip = (page - 1) * limit
      const isActiveParam = c.req.query('isActive')

      const whereClause =
        isActiveParam !== undefined
          ? and(eq(products.storeId, storeId), eq(products.isActive, isActiveParam === 'true'))
          : eq(products.storeId, storeId)

      const [rows, [{ total }]] = await Promise.all([
        db.query.products.findMany({
          where: whereClause,
          limit,
          offset: skip,
          orderBy: [desc(products.createdAt)],
          with: {
            category: { columns: { id: true, name: true, slug: true } },
          },
        }),
        db.select({ total: count() }).from(products).where(whereClause),
      ])

      return c.json({
        data: rows,
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const sellerController = new SellerController()
