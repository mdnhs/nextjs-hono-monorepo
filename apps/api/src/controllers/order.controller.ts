import { Context } from "hono";
import { BaseController } from "./base.controller";
import { orderService, CreateOrderData } from "../services/order.service";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const createOrderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(1),
  }),
});

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export class OrderController extends BaseController {
  async createOrder(c: Context) {
    try {
      const user = c.get("user");
      const validatedData = await this.parseBody<CreateOrderData>(
        c,
        createOrderSchema
      );

      const orders = await orderService.createOrder(user.userId, validatedData);

      return c.json(
        {
          message: "Order(s) created successfully",
          orders,
        },
        201
      );
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getOrders(c: Context) {
    try {
      const user = c.get("user");
      const { page, limit } = this.getPaginationParams(c);
      const status = c.req.query("status") as OrderStatus | undefined;

      const filters = {
        userId: user.userId,
        status,
      };

      const result = await orderService.getOrders(filters, { page, limit });

      return c.json(result);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getAllOrders(c: Context) {
    try {
      const { page, limit } = this.getPaginationParams(c);
      const status = c.req.query("status") as OrderStatus | undefined;
      const storeId = c.req.query("storeId");
      const userId = c.req.query("userId");

      const filters = {
        userId,
        storeId,
        status,
      };

      const result = await orderService.getOrders(filters, { page, limit });

      return c.json(result);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getOrderById(c: Context) {
    try {
      const user = c.get("user");
      const orderId = c.req.param("id")!;

      const order = await orderService.getOrderById(orderId, user.userId);

      return c.json(order);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateOrderStatus(c: Context) {
    try {
      const user = c.get("user");
      const orderId = c.req.param("id")!;
      const { status } = await this.parseBody<{ status: OrderStatus }>(
        c,
        updateOrderStatusSchema
      );

      const order = await orderService.updateOrderStatus(
        orderId,
        status,
        user.userId
      );

      return c.json({
        message: `Order status updated to ${status}`,
        order,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getSellerOrders(c: Context) {
    try {
      const user = c.get("user");
      const { page, limit } = this.getPaginationParams(c);
      const status = c.req.query("status") as OrderStatus | undefined;
      const storeId = c.req.query("storeId");

      const filters = {
        storeId,
        status,
      };

      const result = await orderService.getSellerOrders(
        user.userId, 
        filters, 
        { page, limit }
      );

      return c.json(result);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getStoreOrders(c: Context) {
    try {
      const user = c.get("user");
      const storeId = c.req.param("storeId")!;
      const { page, limit } = this.getPaginationParams(c);

      const result = await orderService.getStoreOrders(storeId, user.userId, {
        page,
        limit,
      });

      return c.json(result);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}

export const orderController = new OrderController();
