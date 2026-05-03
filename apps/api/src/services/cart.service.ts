import { db } from '../db'
import { carts, cartItems, products, productVariants, inventoryLevels } from '../db/schema'
import { eq, and, isNull, sql } from 'drizzle-orm'
import { BaseService } from './base.service'
import { generateCartToken } from '../utils/customer-auth'
import type { CartIdentity } from '../middlewares/storefront'

export interface AddToCartData {
  productId: string
  variantId?: string
  quantity: number
}

export interface UpdateCartItemData {
  quantity: number
}

interface ResolvedCart {
  id: string
  storeId: string
  customerId: string | null
  cartToken: string | null
}

export interface CartLookup {
  identity: CartIdentity
  // If a new guest cart was created, hand the token back to the controller so it can set the cookie.
  newCartToken?: string
}

export interface AbandonedCart {
  cartId: string
  storeId: string
  customerId: string | null
  cartToken: string | null
  itemCount: number
  totalCents: string
  updatedAt: Date
}

export class CartService extends BaseService {
  // Cron entrypoint. Returns carts that have items and have not been updated for `olderThanHours`.
  // Caller (worker) emits cart.abandoned webhook + optional email.
  async findAbandonedCarts(olderThanHours = 24, limit = 500): Promise<AbandonedCart[]> {
    const cutoff = new Date(Date.now() - olderThanHours * 3600 * 1000)
    const rows = await db.query.carts.findMany({
      where: (c, { lt }) => lt(c.updatedAt, cutoff),
      with: { items: { with: { variant: { columns: { priceCents: true } } } } },
      limit,
    })

    return rows
      .filter((r) => r.items.length > 0)
      .map((r) => {
        const totalCents = r.items.reduce((acc, it) => {
          const p = (it.variant?.priceCents as bigint | null) ?? 0n
          return acc + p * BigInt(it.quantity)
        }, 0n)
        return {
          cartId: r.id,
          storeId: r.storeId,
          customerId: r.customerId,
          cartToken: r.cartToken,
          itemCount: r.items.reduce((acc, it) => acc + it.quantity, 0),
          totalCents: totalCents.toString(),
          updatedAt: r.updatedAt,
        }
      })
  }

  // Find or create a cart row for the given identity. Returns the cart + a new token if one was minted.
  private async resolveCart(identity: CartIdentity): Promise<{ cart: ResolvedCart; newCartToken?: string }> {
    if (identity.customerId) {
      const existing = await db.query.carts.findFirst({
        where: and(eq(carts.storeId, identity.storeId), eq(carts.customerId, identity.customerId)),
      })
      if (existing) return { cart: existing }
      const [created] = await db
        .insert(carts)
        .values({ storeId: identity.storeId, customerId: identity.customerId })
        .returning()
      return { cart: created }
    }

    if (identity.cartToken) {
      const existing = await db.query.carts.findFirst({
        where: and(eq(carts.storeId, identity.storeId), eq(carts.cartToken, identity.cartToken)),
      })
      if (existing) return { cart: existing }
      // Token from cookie is stale — mint a fresh one.
    }

    const newToken = generateCartToken()
    const [created] = await db
      .insert(carts)
      .values({ storeId: identity.storeId, cartToken: newToken })
      .returning()
    return { cart: created, newCartToken: newToken }
  }

  // Resolve to a specific variant for a product. If variantId given, must belong to the product.
  // Otherwise pick the default variant (or first if no default).
  private async resolveVariant(productId: string, storeId: string, variantId?: string) {
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.storeId, storeId)),
      with: {
        store: { columns: { id: true, name: true, slug: true, status: true, currency: true } },
        variants: { where: isNull(productVariants.deletedAt) },
      },
    })

    if (!product) throw new Error('Product not found in this store')
    if (!product.isActive) throw new Error('Product is not available')
    if (product.store.status !== 'APPROVED') throw new Error('Store is not available')
    if (product.variants.length === 0) throw new Error('Product has no variants')

    let variant
    if (variantId) {
      variant = product.variants.find((v) => v.id === variantId)
      if (!variant) throw new Error('Variant not found for this product')
    } else {
      variant = product.variants.find((v) => v.isDefault) ?? product.variants[0]
    }

    return { product, variant }
  }

  // Sum available across all locations for a variant.
  private async availableStock(variantId: string): Promise<number> {
    const [row] = await db
      .select({ total: sql<number>`COALESCE(SUM(${inventoryLevels.available}), 0)::int` })
      .from(inventoryLevels)
      .where(eq(inventoryLevels.variantId, variantId))
    return row?.total ?? 0
  }

  async getCart(identity: CartIdentity): Promise<CartLookup & { cart: any }> {
    const { cart, newCartToken } = await this.resolveCart(identity)
    const formatted = await this.loadAndFormat(cart.id, cart)
    return {
      identity: {
        storeId: cart.storeId,
        customerId: cart.customerId,
        cartToken: newCartToken ?? cart.cartToken,
      },
      newCartToken,
      cart: formatted,
    }
  }

  async addToCart(identity: CartIdentity, data: AddToCartData) {
    const { cart, newCartToken } = await this.resolveCart(identity)
    const { variant } = await this.resolveVariant(data.productId, cart.storeId, data.variantId)
    const stock = await this.availableStock(variant.id)

    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variant.id)),
    })

    const target = (existing?.quantity ?? 0) + data.quantity
    if (stock < target) {
      throw new Error(`Only ${stock} available in stock`)
    }

    if (existing) {
      await db.update(cartItems).set({ quantity: target }).where(eq(cartItems.id, existing.id))
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: data.productId,
        variantId: variant.id,
        quantity: data.quantity,
      })
    }

    const formatted = await this.loadAndFormat(cart.id, cart)
    return {
      identity: {
        storeId: cart.storeId,
        customerId: cart.customerId,
        cartToken: newCartToken ?? cart.cartToken,
      },
      newCartToken,
      cart: formatted,
    }
  }

  async updateCartItem(identity: CartIdentity, cartItemId: string, data: UpdateCartItemData) {
    const { cart } = await this.resolveCart(identity)

    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cart.id)),
    })
    if (!item) throw new Error('Item not found in cart')

    if (data.quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, item.id))
    } else {
      const stock = await this.availableStock(item.variantId!)
      if (stock < data.quantity) throw new Error(`Only ${stock} available in stock`)
      await db.update(cartItems).set({ quantity: data.quantity }).where(eq(cartItems.id, item.id))
    }

    const formatted = await this.loadAndFormat(cart.id, cart)
    return { identity, cart: formatted }
  }

  async removeFromCart(identity: CartIdentity, cartItemId: string) {
    const { cart } = await this.resolveCart(identity)
    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cart.id)),
    })
    if (!item) throw new Error('Item not found in cart')
    await db.delete(cartItems).where(eq(cartItems.id, item.id))
    const formatted = await this.loadAndFormat(cart.id, cart)
    return { identity, cart: formatted }
  }

  async clearCart(identity: CartIdentity) {
    const { cart } = await this.resolveCart(identity)
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))
    const formatted = await this.loadAndFormat(cart.id, cart)
    return { identity, cart: formatted }
  }

  // Merge a guest cart into a customer's cart on login. Idempotent.
  async mergeGuestCart(storeId: string, cartToken: string, customerId: string) {
    const guest = await db.query.carts.findFirst({
      where: and(eq(carts.storeId, storeId), eq(carts.cartToken, cartToken)),
      with: { items: true },
    })
    if (!guest) return

    const ownerCart = await this.resolveCart({ storeId, customerId, cartToken: null })

    for (const item of guest.items) {
      if (!item.variantId) continue
      const existing = await db.query.cartItems.findFirst({
        where: and(eq(cartItems.cartId, ownerCart.cart.id), eq(cartItems.variantId, item.variantId)),
      })
      const stock = await this.availableStock(item.variantId)
      const target = Math.min(stock, (existing?.quantity ?? 0) + item.quantity)
      if (target <= 0) continue
      if (existing) {
        await db.update(cartItems).set({ quantity: target }).where(eq(cartItems.id, existing.id))
      } else {
        await db.insert(cartItems).values({
          cartId: ownerCart.cart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: target,
        })
      }
    }

    await db.delete(carts).where(eq(carts.id, guest.id))
  }

  // Internal lookup by id used by order.service to consume the cart.
  async findByIdentity(identity: CartIdentity) {
    if (identity.customerId) {
      return db.query.carts.findFirst({
        where: and(eq(carts.storeId, identity.storeId), eq(carts.customerId, identity.customerId)),
        with: {
          items: {
            with: {
              product: true,
              variant: true,
            },
          },
        },
      })
    }
    if (identity.cartToken) {
      return db.query.carts.findFirst({
        where: and(eq(carts.storeId, identity.storeId), eq(carts.cartToken, identity.cartToken)),
        with: {
          items: {
            with: {
              product: true,
              variant: true,
            },
          },
        },
      })
    }
    return null
  }

  private async loadAndFormat(cartId: string, base: ResolvedCart) {
    const full = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: {
        items: {
          with: {
            product: { columns: { id: true, name: true, images: true, sku: true, storeId: true } },
            variant: true,
          },
        },
      },
    })

    const items = (full?.items ?? []).map((it: any) => {
      const priceCents = it.variant?.priceCents ?? 0n
      const priceNum = Number(priceCents) / 100
      return {
        id: it.id,
        quantity: it.quantity,
        productId: it.productId,
        variantId: it.variantId,
        product: it.product,
        variant: it.variant
          ? {
              id: it.variant.id,
              sku: it.variant.sku,
              name: it.variant.name,
              options: it.variant.options,
              priceCents: priceCents.toString(),
              currency: it.variant.currency,
            }
          : null,
        unitPriceCents: priceCents.toString(),
        subtotalCents: (priceCents * BigInt(it.quantity)).toString(),
        subtotal: priceNum * it.quantity,
      }
    })

    const totalCents = items.reduce((acc, it) => acc + BigInt(it.unitPriceCents) * BigInt(it.quantity), 0n)

    return {
      id: base.id,
      storeId: base.storeId,
      customerId: base.customerId,
      cartToken: base.cartToken,
      items,
      itemCount: items.reduce((s, it) => s + it.quantity, 0),
      uniqueItems: items.length,
      totalCents: totalCents.toString(),
      total: Number(totalCents) / 100,
    }
  }
}

export const cartService = new CartService()
