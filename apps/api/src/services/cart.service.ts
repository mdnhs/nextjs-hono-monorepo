import { prisma } from "../utils/prisma";
import { BaseService } from "./base.service";

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export class CartService extends BaseService {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  store: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return this.formatCartResponse(cart);
  }

  async addToCart(userId: string, data: AddToCartData) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { store: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("Product is not available");
    }

    if (product.store.status !== "PUBLISHED") {
      throw new Error("Store is not available");
    }

    if (product.quantity < data.quantity) {
      throw new Error(`Only ${product.quantity} items available in stock`);
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: data.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;

      if (product.quantity < newQuantity) {
        throw new Error(`Only ${product.quantity} items available in stock`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(
    userId: string,
    productId: string,
    data: UpdateCartItemData
  ) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: { product: true },
    });

    if (!cartItem) {
      throw new Error("Item not found in cart");
    }

    if (data.quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
    } else {
      if (cartItem.product.quantity < data.quantity) {
        throw new Error(
          `Only ${cartItem.product.quantity} items available in stock`
        );
      }

      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: data.quantity },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new Error("Item not found in cart");
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateCart(userId);
  }

  async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const summary = {
      itemCount: 0,
      uniqueItems: cart.items.length,
      subtotal: 0,
      stores: new Map<
        string,
        { name: string; items: any[]; subtotal: number }
      >(),
    };

    for (const item of cart.items) {
      summary.itemCount += item.quantity;
      const itemTotal = Number(item.product.price) * item.quantity;
      summary.subtotal += itemTotal;

      const storeId = item.product.store.id;
      if (!summary.stores.has(storeId)) {
        summary.stores.set(storeId, {
          name: item.product.store.name,
          items: [],
          subtotal: 0,
        });
      }

      const store = summary.stores.get(storeId)!;
      store.items.push({
        ...item,
        total: itemTotal,
      });
      store.subtotal += itemTotal;
    }

    return {
      ...cart,
      summary: {
        itemCount: summary.itemCount,
        uniqueItems: summary.uniqueItems,
        subtotal: summary.subtotal,
        storeBreakdown: Array.from(summary.stores.entries()).map(
          ([storeId, data]) => ({
            storeId,
            storeName: data.name,
            items: data.items,
            subtotal: data.subtotal,
          })
        ),
      },
    };
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
    }));

    const total = items.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      itemCount: items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      ),
      total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}

export const cartService = new CartService();
