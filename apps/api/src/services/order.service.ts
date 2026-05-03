import { db } from '../db'
import { orders, orderItems, products, stores, shippingAddresses } from '../db/schema'
import type { OrderStatus } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { BaseService } from './base.service'
import { cartService } from './cart.service'
import { emitWebhook, WEBHOOK_TOPICS } from './webhook.service'

export interface ShippingAddressData {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export interface CreateOrderData {
  shippingAddress: ShippingAddressData
}

export interface OrderFilters {
  userId?: string
  storeId?: string
  status?: OrderStatus
  storeOwnerId?: string
}

import { inventoryService } from './inventory.service'
import { calculationService } from './calculation.service'
import { toCents, centsToNumericString } from '../utils/money'
import { locations } from '../db/schema'

export class OrderService extends BaseService {
  async createOrder(userId: string, data: CreateOrderData & { discountCode?: string; locationId?: string }) {
    const cart = await cartService.getOrCreateCart(userId)

    if (cart.items.length === 0) {
      throw new Error('Cart is empty')
    }

    // Default to the store's default location if not provided
    let locationId = data.locationId

    const storeOrders = new Map<string, any[]>()

    for (const item of cart.items) {
      const storeId = item.product.store.id
      if (!storeOrders.has(storeId)) {
        storeOrders.set(storeId, [])
      }
      storeOrders.get(storeId)!.push(item)
    }

    const createdOrders = []

    for (const [storeId, items] of storeOrders) {
      // 1. Resolve Location
      if (!locationId) {
        const defaultLoc = await db.query.locations.findFirst({
          where: and(eq(locations.storeId, storeId), eq(locations.isDefault, true))
        })
        if (!defaultLoc) throw new Error(`No default location found for store ${storeId}`)
        locationId = defaultLoc.id
      }

      // 2. Calculate Totals
      const calcResult = await calculationService.calculate(storeId, {
        items: items.map(i => ({
          priceCents: i.product.priceCents,
          quantity: i.quantity,
          productId: i.product.id
        })),
        discountCode: data.discountCode
      })

      const order = await db.transaction(async (tx) => {
        // 3. Reserve Inventory
        for (const item of items) {
          await inventoryService.reserve({
            variantId: item.variantId ?? 'default', // Fallback for legacy
            locationId: locationId!,
            quantity: item.quantity,
            reason: 'Order Created',
          })
        }

        // 4. Create Order record
        const [createdOrder] = await tx
          .insert(orders)
          .values({
            userId,
            storeId,
            total: centsToNumericString(calcResult.totalCents),
            totalCents: calcResult.totalCents,
            currency: items[0].product.currency ?? 'USD',
            status: 'PENDING',
          })
          .returning()

        await tx.insert(orderItems).values(
          items.map((item: any) => ({
            orderId: createdOrder.id,
            productId: item.product.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.product.price,
            priceCents: item.product.priceCents,
            currency: item.product.currency,
          }))
        )

        await tx.insert(shippingAddresses).values({
          orderId: createdOrder.id,
          ...data.shippingAddress,
        })

        return this.getOrderWithDetails(tx, createdOrder.id)
      })

      createdOrders.push(order)
    }

    await cartService.clearCart(userId)

    return createdOrders
  }

  async getOrders(filters: OrderFilters, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)

    const conditions: any[] = []
    if (filters.userId) conditions.push(eq(orders.userId, filters.userId))
    if (filters.storeId) conditions.push(eq(orders.storeId, filters.storeId))
    if (filters.status) conditions.push(eq(orders.status, filters.status))

    if (filters.storeOwnerId) {
      // Join with stores to filter by store owner
      const ownerStores = await db.query.stores.findMany({
        where: eq(stores.ownerId, filters.storeOwnerId),
        columns: { id: true },
      })
      const storeIds = ownerStores.map((s) => s.id)
      if (storeIds.length > 0) {
        conditions.push(
          sql`${orders.storeId} IN (${sql.join(storeIds.map((id) => sql`${id}`), sql`, `)})`
        )
      } else {
        return this.formatPaginatedResult([], 0, page, limit)
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, [{ total }]] = await Promise.all([
      db.query.orders.findMany({
        where: whereClause,
        limit,
        offset: skip,
        orderBy: (o, { desc }) => [desc(o.createdAt)],
        with: {
          items: {
            with: {
              product: { columns: { id: true, name: true, images: true, sku: true } },
            },
          },
          shippingAddress: true,
          store: { columns: { id: true, name: true, slug: true } },
          user: { columns: { id: true, name: true, email: true } },
        },
      }),
      db.select({ total: sql<number>`count(*)::int` }).from(orders).where(whereClause),
    ])

    return this.formatPaginatedResult(rows, Number(total), page, limit)
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, images: true, sku: true, description: true } },
          },
        },
        shippingAddress: true,
        store: {
          columns: { id: true, name: true, slug: true },
          with: { owner: { columns: { id: true, name: true, email: true } } },
        },
        user: { columns: { id: true, name: true, email: true } },
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.userId !== userId && order.store.owner.id !== userId) {
      throw new Error('Not authorized to view this order')
    }

    return order
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { store: { columns: { ownerId: true } } },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.store.ownerId !== userId) {
      throw new Error('Not authorized to update this order')
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    }

    if (!allowedTransitions[order.status].includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`)
    }

    if (status === 'CANCELLED' || status === 'REFUNDED') {
      const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, orderId) })

      await db.transaction(async (tx) => {
        for (const item of items) {
          await tx
            .update(products)
            .set({ quantity: sql`${products.quantity} + ${item.quantity}` })
            .where(eq(products.id, item.productId))
        }

        await tx.update(orders).set({ status }).where(eq(orders.id, orderId))
      })
    } else {
      await db.update(orders).set({ status }).where(eq(orders.id, orderId))
    }

    return this.getOrderById(orderId, userId)
  }

  async getSellerOrders(
    ownerId: string,
    filters: Omit<OrderFilters, 'storeOwnerId'> = {},
    pagination: { page: number; limit: number }
  ) {
    return this.getOrders({ ...filters, storeOwnerId: ownerId }, pagination)
  }

  async getStoreOrders(storeId: string, userId: string, pagination: { page: number; limit: number }) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, storeId) })

    if (!store) {
      throw new Error('Store not found')
    }

    if (store.ownerId !== userId) {
      throw new Error('Not authorized to view store orders')
    }

    return this.getOrders({ storeId }, pagination)
  }

  private async getOrderWithDetails(tx: any, orderId: string) {
    return tx.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, images: true, sku: true } },
          },
        },
        shippingAddress: true,
        store: { columns: { id: true, name: true, slug: true } },
      },
    })
  }
}

export const orderService = new OrderService()
