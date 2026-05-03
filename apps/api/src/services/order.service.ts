import { db } from '../db'
import {
  orders,
  orderItems,
  stores,
  shippingAddresses,
  customers,
  locations,
  inventoryLevels,
  inventoryTransactions,
} from '../db/schema'
import type { OrderStatus } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { BaseService } from './base.service'
import { cartService } from './cart.service'
import { emitWebhook, WEBHOOK_TOPICS } from './webhook.service'
import { inventoryService } from './inventory.service'
import { calculationService } from './calculation.service'
import { centsToNumericString } from '../utils/money'
import type { CartIdentity } from '../middlewares/storefront'

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
  discountCode?: string
  locationId?: string
  // Required for guest checkout when identity has no customerId.
  guestEmail?: string
  guestName?: string
  guestPhone?: string
}

export interface OrderFilters {
  userId?: string
  customerId?: string
  storeId?: string
  status?: OrderStatus
  storeOwnerId?: string
}

export class OrderService extends BaseService {
  // Storefront checkout. Identity is either a logged-in customer or a guest cart token.
  async createOrderFromCart(identity: CartIdentity, data: CreateOrderData) {
    const cart = await cartService.findByIdentity(identity)
    if (!cart || cart.items.length === 0) throw new Error('Cart is empty')

    // Resolve customer: existing, or auto-create from guest email.
    let customerId = identity.customerId
    if (!customerId) {
      if (!data.guestEmail) throw new Error('Guest email required for checkout')
      const existing = await db.query.customers.findFirst({
        where: and(eq(customers.storeId, identity.storeId), eq(customers.email, data.guestEmail)),
      })
      if (existing) {
        customerId = existing.id
      } else {
        const [created] = await db
          .insert(customers)
          .values({
            storeId: identity.storeId,
            email: data.guestEmail,
            name: data.guestName ?? null,
            phone: data.guestPhone ?? null,
          })
          .returning()
        customerId = created.id
      }
    }

    // Resolve location.
    let locationId = data.locationId
    if (!locationId) {
      const def = await db.query.locations.findFirst({
        where: and(eq(locations.storeId, identity.storeId), eq(locations.isDefault, true)),
      })
      if (!def) throw new Error('No default location for store')
      locationId = def.id
    }

    // Validate variants and build calc input.
    const calcItems = cart.items.map((it: any) => {
      if (!it.variantId) throw new Error(`Cart item ${it.id} has no variant`)
      if (!it.variant) throw new Error('Variant missing')
      return {
        priceCents: it.variant.priceCents as bigint,
        quantity: it.quantity,
        productId: it.productId,
      }
    })

    const calc = await calculationService.calculate(identity.storeId, {
      items: calcItems,
      discountCode: data.discountCode,
    })

    const currency = (cart.items[0] as any).variant?.currency ?? 'USD'

    const order = await db.transaction(async (tx) => {
      // Reserve inventory atomically. inventoryService.reserve uses its own tx — we run sequentially before opening order tx.
      // Note: this gives us correctness (no oversell) at cost of two-phase work; refactor inventoryService to accept a tx if you need full atomicity.

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          customerId,
          storeId: identity.storeId,
          guestEmail: identity.customerId ? null : data.guestEmail ?? null,
          guestName: identity.customerId ? null : data.guestName ?? null,
          total: centsToNumericString(calc.totalCents),
          totalCents: calc.totalCents,
          currency,
          status: 'PENDING',
        })
        .returning()

      await tx.insert(orderItems).values(
        cart.items.map((it: any) => ({
          orderId: createdOrder.id,
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
          price: centsToNumericString(it.variant.priceCents as bigint),
          priceCents: it.variant.priceCents as bigint,
          currency: it.variant.currency,
        }))
      )

      await tx.insert(shippingAddresses).values({
        orderId: createdOrder.id,
        ...data.shippingAddress,
      })

      return createdOrder
    })

    // Reserve inventory after order row exists so referenceId is set. Failures here cancel the order.
    try {
      for (const it of cart.items) {
        await inventoryService.reserve({
          variantId: it.variantId!,
          locationId,
          quantity: it.quantity,
          reason: 'Order Created',
          referenceId: order.id,
          referenceType: 'ORDER',
        })
      }
    } catch (err) {
      await db.update(orders).set({ status: 'CANCELLED' }).where(eq(orders.id, order.id))
      throw err
    }

    await cartService.clearCart(identity)

    await emitWebhook(identity.storeId, WEBHOOK_TOPICS.ORDER_CREATED, {
      orderId: order.id,
      totalCents: calc.totalCents.toString(),
      currency,
    })

    return this.getOrderById(order.id)
  }

  async getOrders(filters: OrderFilters, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)

    const conditions: any[] = []
    if (filters.userId) conditions.push(eq(orders.userId, filters.userId))
    if (filters.customerId) conditions.push(eq(orders.customerId, filters.customerId))
    if (filters.storeId) conditions.push(eq(orders.storeId, filters.storeId))
    if (filters.status) conditions.push(eq(orders.status, filters.status))

    if (filters.storeOwnerId) {
      const ownerStores = await db.query.stores.findMany({
        where: eq(stores.ownerId, filters.storeOwnerId),
        columns: { id: true },
      })
      const storeIds = ownerStores.map((s) => s.id)
      if (storeIds.length === 0) {
        return this.formatPaginatedResult([], 0, page, limit)
      }
      conditions.push(
        sql`${orders.storeId} IN (${sql.join(storeIds.map((id) => sql`${id}`), sql`, `)})`
      )
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
              variant: true,
            },
          },
          shippingAddress: true,
          store: { columns: { id: true, name: true, slug: true } },
          customer: { columns: { id: true, name: true, email: true } },
          user: { columns: { id: true, name: true, email: true } },
        },
      }),
      db.select({ total: sql<number>`count(*)::int` }).from(orders).where(whereClause),
    ])

    return this.formatPaginatedResult(rows, Number(total), page, limit)
  }

  async getOrderById(orderId: string, requesterUserId?: string, requesterCustomerId?: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, images: true, sku: true, description: true } },
            variant: true,
          },
        },
        shippingAddress: true,
        store: {
          columns: { id: true, name: true, slug: true },
          with: { owner: { columns: { id: true, name: true, email: true } } },
        },
        customer: { columns: { id: true, name: true, email: true } },
        user: { columns: { id: true, name: true, email: true } },
      },
    })

    if (!order) throw new Error('Order not found')

    // Authorization: explicit requester scoping. Skip when neither id given (admin paths).
    if (requesterUserId !== undefined || requesterCustomerId !== undefined) {
      const isOwner = order.store.owner.id === requesterUserId
      const isPlacingUser = requesterUserId && order.userId === requesterUserId
      const isCustomer = requesterCustomerId && order.customerId === requesterCustomerId
      if (!isOwner && !isPlacingUser && !isCustomer) {
        throw new Error('Not authorized to view this order')
      }
    }

    return order
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, requesterUserId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { store: { columns: { ownerId: true } } },
    })

    if (!order) throw new Error('Order not found')
    if (order.store.ownerId !== requesterUserId) throw new Error('Not authorized to update this order')

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
      await this.releaseReservedInventory(orderId)
    }

    await db.update(orders).set({ status }).where(eq(orders.id, orderId))
    return this.getOrderById(orderId)
  }

  // Release reservations for every line item on the order.
  // Inventory: move quantity from reserved → available.
  private async releaseReservedInventory(orderId: string) {
    const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, orderId) })

    await db.transaction(async (tx) => {
      for (const item of items) {
        if (!item.variantId) continue
        const levels = await tx.query.inventoryLevels.findMany({
          where: eq(inventoryLevels.variantId, item.variantId),
        })
        // Walk locations and release until quota satisfied. Simple greedy strategy.
        let remaining = item.quantity
        for (const level of levels) {
          if (remaining <= 0) break
          const take = Math.min(level.reserved, remaining)
          if (take === 0) continue
          await tx
            .update(inventoryLevels)
            .set({
              reserved: sql`${inventoryLevels.reserved} - ${take}`,
              available: sql`${inventoryLevels.available} + ${take}`,
            })
            .where(eq(inventoryLevels.id, level.id))
          await tx.insert(inventoryTransactions).values({
            inventoryLevelId: level.id,
            type: 'RETURN',
            quantity: take,
            reason: 'Order Cancelled / Refunded',
            referenceId: orderId,
            referenceType: 'ORDER',
          })
          remaining -= take
        }
      }
    })
  }

  async getSellerOrders(
    ownerId: string,
    filters: Omit<OrderFilters, 'storeOwnerId'> = {},
    pagination: { page: number; limit: number }
  ) {
    return this.getOrders({ ...filters, storeOwnerId: ownerId }, pagination)
  }

  async getStoreOrders(storeId: string, requesterUserId: string, pagination: { page: number; limit: number }) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, storeId) })
    if (!store) throw new Error('Store not found')
    if (store.ownerId !== requesterUserId) throw new Error('Not authorized to view store orders')
    return this.getOrders({ storeId }, pagination)
  }
}

export const orderService = new OrderService()
