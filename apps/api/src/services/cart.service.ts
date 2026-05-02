import { db } from '../db'
import { carts, cartItems, products } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { BaseService } from './base.service'

export interface AddToCartData {
  productId: string
  quantity: number
}

export interface UpdateCartItemData {
  quantity: number
}

export class CartService extends BaseService {
  async getOrCreateCart(userId: string) {
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      with: {
        items: {
          with: {
            product: {
              with: {
                store: { columns: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    })

    if (!cart) {
      const [newCart] = await db.insert(carts).values({ userId }).returning()
      cart = { ...newCart, items: [] }
    }

    return this.formatCartResponse(cart)
  }

  async addToCart(userId: string, data: AddToCartData) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, data.productId),
      with: { store: true },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    if (!product.isActive) {
      throw new Error('Product is not available')
    }

    if (product.store.status !== 'APPROVED') {
      throw new Error('Store is not available')
    }

    if (product.quantity < data.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`)
    }

    const cart = await this.getOrCreateCart(userId)

    const existingItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, data.productId)),
    })

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity

      if (product.quantity < newQuantity) {
        throw new Error(`Only ${product.quantity} items available in stock`)
      }

      await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
      })
    }

    return this.getOrCreateCart(userId)
  }

  async updateCartItem(userId: string, productId: string, data: UpdateCartItemData) {
    const cart = await this.getOrCreateCart(userId)

    const cartItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
      with: { product: true },
    })

    if (!cartItem) {
      throw new Error('Item not found in cart')
    }

    if (data.quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItem.id))
    } else {
      if (cartItem.product.quantity < data.quantity) {
        throw new Error(`Only ${cartItem.product.quantity} items available in stock`)
      }

      await db.update(cartItems).set({ quantity: data.quantity }).where(eq(cartItems.id, cartItem.id))
    }

    return this.getOrCreateCart(userId)
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId)

    const cartItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
    })

    if (!cartItem) {
      throw new Error('Item not found in cart')
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItem.id))

    return this.getOrCreateCart(userId)
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId)

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))

    return this.getOrCreateCart(userId)
  }

  async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId)

    const summary = {
      itemCount: 0,
      uniqueItems: cart.items.length,
      subtotal: 0,
      stores: new Map<string, { name: string; items: any[]; subtotal: number }>(),
    }

    for (const item of cart.items) {
      summary.itemCount += item.quantity
      const itemTotal = Number(item.product.price) * item.quantity
      summary.subtotal += itemTotal

      const storeId = item.product.store.id
      if (!summary.stores.has(storeId)) {
        summary.stores.set(storeId, { name: item.product.store.name, items: [], subtotal: 0 })
      }

      const store = summary.stores.get(storeId)!
      store.items.push({ ...item, total: itemTotal })
      store.subtotal += itemTotal
    }

    return {
      ...cart,
      summary: {
        itemCount: summary.itemCount,
        uniqueItems: summary.uniqueItems,
        subtotal: summary.subtotal,
        storeBreakdown: Array.from(summary.stores.entries()).map(([storeId, data]) => ({
          storeId,
          storeName: data.name,
          items: data.items,
          subtotal: data.subtotal,
        })),
      },
    }
  }

  private formatCartResponse(cart: any) {
    const items = cart.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: Number(item.product.price),
        images: item.product.images,
        sku: item.product.sku,
        quantity: item.product.quantity,
        store: item.product.store,
      },
      subtotal: Number(item.product.price) * item.quantity,
    }))

    const total = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }
  }
}

export const cartService = new CartService()
