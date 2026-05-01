import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { BaseService } from "./base.service";
import { cartService } from "./cart.service";

export interface ShippingAddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddressData;
}

export interface OrderFilters {
  userId?: string;
  storeId?: string;
  status?: OrderStatus;
  storeOwnerId?: string; // Filter by store owner for sellers
}

export class OrderService extends BaseService {
  async createOrder(userId: string, data: CreateOrderData) {
    const cart = await cartService.getOrCreateCart(userId);

    if (cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const storeOrders = new Map<string, any[]>();

    for (const item of cart.items) {
      const storeId = item.product.store.id;
      if (!storeOrders.has(storeId)) {
        storeOrders.set(storeId, []);
      }
      storeOrders.get(storeId)!.push(item);
    }

    const orders = [];

    for (const [storeId, items] of storeOrders) {
      const orderTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

      const order = await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.product.id },
          });

          if (!product) {
            throw new Error(`Product ${item.product.name} not found`);
          }

          if (product.quantity < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.quantity}`
            );
          }

          await tx.product.update({
            where: { id: product.id },
            data: {
              quantity: product.quantity - item.quantity,
            },
          });
        }

        const createdOrder = await tx.order.create({
          data: {
            userId,
            storeId,
            total: orderTotal,
            status: OrderStatus.PENDING,
            items: {
              create: items.map((item: any) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
            shippingAddress: {
              create: data.shippingAddress,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    sku: true,
                  },
                },
              },
            },
            shippingAddress: true,
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return createdOrder;
      });

      orders.push(order);
    }

    await cartService.clearCart(userId);

    return orders;
  }

  async getOrders(
    filters: OrderFilters,
    pagination: { page: number; limit: number }
  ) {
    const { page, limit, skip } = this.getPaginationParams(pagination);

    const where: Prisma.OrderWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.storeId && { storeId: filters.storeId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.storeOwnerId && {
        store: { ownerId: filters.storeOwnerId }
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  sku: true,
                },
              },
            },
          },
          shippingAddress: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.order.count({ where }),
    ]);

    return this.formatPaginatedResult(orders, total, page, limit);
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
                description: true,
              },
            },
          },
        },
        shippingAddress: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId && order.store.owner.id !== userId) {
      throw new Error("Not authorized to view this order");
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.store.ownerId !== userId) {
      throw new Error("Not authorized to update this order");
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!allowedTransitions[order.status].includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
      });

      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
    }

    return this.getOrderById(orderId, userId);
  }

  async getSellerOrders(
    ownerId: string,
    filters: Omit<OrderFilters, 'storeOwnerId'> = {},
    pagination: { page: number; limit: number }
  ) {
    return this.getOrders(
      { 
        ...filters, 
        storeOwnerId: ownerId
      },
      pagination
    );
  }

  async getStoreOrders(
    storeId: string,
    userId: string,
    pagination: { page: number; limit: number }
  ) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error("Store not found");
    }

    if (store.ownerId !== userId) {
      throw new Error("Not authorized to view store orders");
    }

    return this.getOrders({ storeId }, pagination);
  }
}

export const orderService = new OrderService();
