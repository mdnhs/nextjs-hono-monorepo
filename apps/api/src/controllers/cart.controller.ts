import { Context } from "hono";
import { BaseController } from "./base.controller";
import {
  cartService,
  AddToCartData,
  UpdateCartItemData,
} from "../services/cart.service";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export class CartController extends BaseController {
  async getCart(c: Context) {
    try {
      const user = c.get("user");
      const cart = await cartService.getOrCreateCart(user.userId);

      return c.json(cart);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getCartSummary(c: Context) {
    try {
      const user = c.get("user");
      const summary = await cartService.getCartSummary(user.userId);

      return c.json(summary);
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async addToCart(c: Context) {
    try {
      const user = c.get("user");
      const validatedData = await this.parseBody<AddToCartData>(
        c,
        addToCartSchema
      );

      const cart = await cartService.addToCart(user.userId, validatedData);

      return c.json({
        message: "Product added to cart",
        cart,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateCartItem(c: Context) {
    try {
      const user = c.get("user");
      const productId = c.req.param("productId")!;
      const validatedData = await this.parseBody<UpdateCartItemData>(
        c,
        updateCartItemSchema
      );

      const cart = await cartService.updateCartItem(
        user.userId,
        productId,
        validatedData
      );

      return c.json({
        message:
          validatedData.quantity === 0
            ? "Item removed from cart"
            : "Cart updated",
        cart,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async removeFromCart(c: Context) {
    try {
      const user = c.get("user");
      const productId = c.req.param("productId")!;

      const cart = await cartService.removeFromCart(user.userId, productId);

      return c.json({
        message: "Item removed from cart",
        cart,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async clearCart(c: Context) {
    try {
      const user = c.get("user");

      const cart = await cartService.clearCart(user.userId);

      return c.json({
        message: "Cart cleared",
        cart,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}

export const cartController = new CartController();
