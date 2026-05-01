import { Context } from 'hono'
import { BaseController } from './base.controller'
import { storeService } from '../services/store.service'
import { subscriptionService } from '../services/subscription.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const approveStoreSchema = z.object({
  planId: z.string().optional(),
})

export class AdminController extends BaseController {
  async getDashboard(c: Context) {
    try {
      const [
        totalStores,
        pendingStores,
        approvedStores,
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
      ] = await Promise.all([
        prisma.store.count(),
        prisma.store.count({ where: { status: 'PENDING' } }),
        prisma.store.count({ where: { status: 'APPROVED' } }),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'SELLER' } }),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' } },
        }),
      ])

      return c.json({
        stores: {
          total: totalStores,
          pending: pendingStores,
          approved: approvedStores,
        },
        users: {
          total: totalUsers,
          sellers: totalSellers,
        },
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue._sum.total || 0,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getAllStores(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const status = c.req.query('status') as any

      const filters = {
        status,
      }

      const result = await storeService.getAllStores(filters, { page, limit })
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getPendingStores(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const result = await storeService.getAllStores({ status: 'PENDING' }, { page, limit })
      return c.json(result)
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
          await subscriptionService.createSubscription({
            storeId,
            planId,
          })
        }
      }

      return c.json({
        message: 'Store approved successfully',
        store,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async rejectStore(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!

      const store = await storeService.rejectStore(storeId, user.userId)

      return c.json({
        message: 'Store rejected',
        store,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async suspendStore(c: Context) {
    try {
      const user = c.get('user')
      const storeId = c.req.param('id')!

      const store = await storeService.suspendStore(storeId, user.userId)

      return c.json({
        message: 'Store suspended',
        store,
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getAllUsers(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const role = c.req.query('role')
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}
      if (role) {
        where.role = role
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            _count: {
              select: { stores: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ])

      return c.json({
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getUserDetails(c: Context) {
    try {
      const userId = c.req.param('id')!
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          stores: {
            include: {
              subscriptions: {
                include: {
                  plan: true,
                },
              },
              _count: {
                select: {
                  products: true,
                  orders: true,
                },
              },
            },
          },
        },
      })

      if (!user) {
        return c.json({ error: 'User not found' }, 404)
      }

      return c.json(user)
    } catch (error: any) {
      return this.handleError(error)
    }
  }

  async getSubscriptions(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c)
      const status = c.req.query('status')
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}
      if (status) {
        where.status = status
      }

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          skip,
          take: limit,
          include: {
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                priceMonthly: true,
                priceYearly: true,
              },
            },
          },
          orderBy: { currentPeriodEnd: 'desc' },
        }),
        prisma.subscription.count({ where }),
      ])

      return c.json({
        data: subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const adminController = new AdminController()
