import { Context } from 'hono'
import { BaseController } from './base.controller'
import { storeService } from '../services/store.service'
import { subscriptionService } from '../services/subscription.service'
import { db } from '../db'
import { stores, users, products, orders, subscriptions } from '../db/schema'
import { eq, ne, sql, count, sum, desc } from 'drizzle-orm'
import { z } from 'zod'

const approveStoreSchema = z.object({
  planId: z.string().optional(),
})

export class AdminController extends BaseController {
  async getDashboard(c: Context) {
    try {
      const [
        [{ totalStores }],
        [{ pendingStores }],
        [{ approvedStores }],
        [{ totalUsers }],
        [{ totalSellers }],
        [{ totalStoreAdmins }],
        [{ totalPlatformAdmins }],
        [{ totalProducts }],
        [{ totalOrders }],
        [{ revenue }],
      ] = await Promise.all([
        db.select({ totalStores: count() }).from(stores),
        db.select({ pendingStores: count() }).from(stores).where(eq(stores.status, 'PENDING')),
        db.select({ approvedStores: count() }).from(stores).where(eq(stores.status, 'APPROVED')),
        db.select({ totalUsers: count() }).from(users),
        db.select({ totalSellers: count() }).from(users).where(eq(users.role, 'SELLER')),
        db.select({ totalStoreAdmins: count() }).from(users).where(eq(users.role, 'STORE_ADMIN')),
        db.select({ totalPlatformAdmins: count() }).from(users).where(eq(users.role, 'PLATFORM_ADMIN')),
        db.select({ totalProducts: count() }).from(products),
        db.select({ totalOrders: count() }).from(orders),
        db
          .select({ revenue: sum(orders.total) })
          .from(orders)
          .where(ne(orders.status, 'CANCELLED')),
      ])

      return this.success(c, {
        stores: {
          total: Number(totalStores),
          pending: Number(pendingStores),
          approved: Number(approvedStores),
        },
        users: {
          total: Number(totalUsers),
          sellers: Number(totalSellers),
          storeAdmins: Number(totalStoreAdmins),
          platformAdmins: Number(totalPlatformAdmins),
        },
        products: Number(totalProducts),
        orders: Number(totalOrders),
        revenue: revenue ? Number(revenue) : 0,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getAllStores(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const statusRaw = c.req.query('status')
      const status = statusRaw ? (statusRaw.toUpperCase() as any) : undefined

      const result = await storeService.getAllStores({ status }, { page, limit })
      return this.paginate(c, result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getPendingStores(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const result = await storeService.getAllStores({ status: 'PENDING' }, { page, limit })
      return this.paginate(c, result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async approveStore(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!
      const { planId } = await this.parseBody(c, approveStoreSchema)

      const store = await storeService.approveStore(storeId, user.userId)

      if (planId) {
        const existing = await subscriptionService.getSubscriptionByStoreId(storeId)
        if (!existing) {
          await subscriptionService.createSubscription({ storeId, planId })
        }
      }

      return this.success(c, store, 'Store approved successfully')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async rejectStore(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!

      const store = await storeService.rejectStore(storeId, user.userId)

      return this.success(c, store, 'Store rejected')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async suspendStore(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!

      const store = await storeService.suspendStore(storeId, user.userId)

      return this.success(c, store, 'Store suspended')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getAllUsers(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const roleRaw = c.req.query('role')
      const role = roleRaw ? (roleRaw.toUpperCase() as any) : undefined
      const skip = (page - 1) * limit

      const whereClause = role ? eq(users.role, role) : undefined

      const [rows, [{ total }]] = await Promise.all([
        db.query.users.findMany({
          where: whereClause,
          limit,
          offset: skip,
          orderBy: [desc(users.createdAt)],
          columns: { id: true, email: true, name: true, role: true, createdAt: true },
          with: { stores: { columns: { id: true } } },
        }),
        db.select({ total: sql<number>`count(*)::int` }).from(users).where(whereClause),
      ])

      const usersWithCount = rows.map((u) => ({
        ...u,
        _count: { stores: u.stores.length },
        stores: undefined,
      }))

      return this.paginate(c, {
        data: usersWithCount,
        pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getUserDetails(c: Context) {
    try {
      const userId = c.req.param('id')!
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          stores: {
            with: {
              subscriptions: { with: { plan: true } },
            },
          },
        },
      })

      if (!user) {
        return c.json({
          data: null,
          error: true,
          message: 'User not found'
        }, 404)
      }

      return this.success(c, user)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getSubscriptions(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const statusRaw = c.req.query('status')
      const status = statusRaw ? (statusRaw.toUpperCase() as any) : undefined
      const skip = (page - 1) * limit

      const whereClause = status ? eq(subscriptions.status, status) : undefined

      const [rows, [{ total }]] = await Promise.all([
        db.query.subscriptions.findMany({
          where: whereClause,
          limit,
          offset: skip,
          orderBy: (s, { desc }) => [desc(s.currentPeriodEnd)],
          with: {
            store: { columns: { id: true, name: true, slug: true } },
            plan: { columns: { id: true, name: true, priceMonthly: true, priceYearly: true } },
          },
        }),
        db.select({ total: sql<number>`count(*)::int` }).from(subscriptions).where(whereClause),
      ])

      return this.paginate(c, {
        data: rows,
        pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async cancelSubscription(c: Context) {
    try {
      const id = c.req.param('id')!
      const sub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, id),
      })

      if (!sub) {
        return c.json({
          data: null,
          error: true,
          message: 'Subscription not found'
        }, 404)
      }

      const updated = await subscriptionService.cancelSubscription(sub.storeId)
      return this.success(c, updated, 'Subscription cancelled')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async updateSubscription(c: Context) {
    try {
      const id = c.req.param('id')!
      const { planId } = await c.req.json()

      const sub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, id),
      })

      if (!sub) {
        return c.json({
          data: null,
          error: true,
          message: 'Subscription not found'
        }, 404)
      }

      const updated = await subscriptionService.updateSubscriptionPlan(sub.storeId, planId)
      return this.success(c, updated, 'Subscription updated')
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getAllOrders(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const statusRaw = c.req.query('status')
      const status = statusRaw ? (statusRaw.toUpperCase() as any) : undefined
      const skip = (page - 1) * limit

      const whereClause = status ? eq(orders.status, status) : undefined

      const [rows, [{ total }]] = await Promise.all([
        db.query.orders.findMany({
          where: whereClause,
          limit,
          offset: skip,
          orderBy: [desc(orders.createdAt)],
          with: {
            store: { columns: { id: true, name: true, slug: true } },
            user: { columns: { id: true, name: true, email: true } },
          },
        }),
        db.select({ total: sql<number>`count(*)::int` }).from(orders).where(whereClause),
      ])

      return this.paginate(c, {
        data: rows,
        pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const adminController = new AdminController()
