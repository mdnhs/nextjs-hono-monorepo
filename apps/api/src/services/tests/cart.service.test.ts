import { describe, it, expect, beforeEach, vi } from "vitest";
import { CartService } from "../cart.service";
import { prisma } from "../../utils/prisma";
import { StoreStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { faker } from "@faker-js/faker";

// Mock the prisma client
vi.mock("../../utils/prisma");

describe("CartService", () => {
  let cartService: CartService;

  const mockUserId = faker.string.uuid();
  const mockCartId = faker.string.uuid();
  const mockProductId = faker.string.uuid();
  const mockStoreId = faker.string.uuid();
  const mockCartItemId = faker.string.uuid();

  const mockStore = {
    id: mockStoreId,
    name: faker.company.name(),
    slug: faker.internet.domainWord(),
    status: StoreStatus.APPROVED,
  };

  const mockProduct = {
    id: mockProductId,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: new Decimal(faker.commerce.price()),
    images: [faker.image.url()],
    sku: faker.string.alphanumeric(10).toUpperCase(),
    quantity: 10,
    isActive: true,
    store: mockStore,
  };

  const mockCartItem = {
    id: mockCartItemId,
    cartId: mockCartId,
    productId: mockProductId,
    quantity: 2,
    product: mockProduct,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCart = {
    id: mockCartId,
    userId: mockUserId,
    items: [mockCartItem],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    cartService = new CartService();
    vi.clearAllMocks();
  });

  describe("getOrCreateCart", () => {
    it("should return existing cart when found", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);

      const result = await cartService.getOrCreateCart(mockUserId);

      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
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

      expect(prisma.cart.create).not.toHaveBeenCalled();
      expect(result.userId).toBe(mockUserId);
      expect(result.items).toHaveLength(1);
    });

    it("should create new cart when not found", async () => {
      const emptyCart = {
        id: mockCartId,
        userId: mockUserId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.cart.findUnique as any).mockResolvedValue(null);
      (prisma.cart.create as any).mockResolvedValue(emptyCart);

      const result = await cartService.getOrCreateCart(mockUserId);

      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: mockUserId },
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

      expect(result.userId).toBe(mockUserId);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should format cart response with calculated totals", async () => {
      const multiItemCart = {
        ...mockCart,
        items: [
          mockCartItem,
          {
            ...mockCartItem,
            id: faker.string.uuid(),
            productId: faker.string.uuid(),
            quantity: 3,
            product: {
              ...mockProduct,
              id: faker.string.uuid(),
              price: new Decimal("50.00"),
            },
          },
        ],
      };

      (prisma.cart.findUnique as any).mockResolvedValue(multiItemCart);

      const result = await cartService.getOrCreateCart(mockUserId);

      expect(result.itemCount).toBe(5); // 2 + 3
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toHaveProperty("subtotal");
      expect(result).toHaveProperty("total");
    });
  });

  describe("addToCart", () => {
    const addToCartData = {
      productId: mockProductId,
      quantity: 2,
    };

    it("should add new item to cart", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);
      (prisma.cart.findUnique as any)
        .mockResolvedValueOnce(null) // First call for getOrCreateCart
        .mockResolvedValueOnce(mockCart); // Second call after adding item
      (prisma.cart.create as any).mockResolvedValue({
        ...mockCart,
        items: [],
      });
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);
      (prisma.cartItem.create as any).mockResolvedValue(mockCartItem);

      const result = await cartService.addToCart(mockUserId, addToCartData);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: { store: true },
      });

      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: mockCartId,
          productId: mockProductId,
          quantity: 2,
        },
      });

      expect(result.userId).toBe(mockUserId);
    });

    it("should update quantity when item already exists in cart", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue(mockCartItem);
      (prisma.cartItem.update as any).mockResolvedValue({
        ...mockCartItem,
        quantity: 4,
      });

      await cartService.addToCart(mockUserId, addToCartData);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: mockCartItemId },
        data: { quantity: 4 }, // 2 existing + 2 new
      });

      expect(prisma.cartItem.create).not.toHaveBeenCalled();
    });

    it("should throw error when product not found", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(
        cartService.addToCart(mockUserId, addToCartData)
      ).rejects.toThrow("Product not found");

      expect(prisma.cartItem.create).not.toHaveBeenCalled();
    });

    it("should throw error when product is inactive", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await expect(
        cartService.addToCart(mockUserId, addToCartData)
      ).rejects.toThrow("Product is not available");
    });

    it("should throw error when store is not published", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: { ...mockStore, status: StoreStatus.PENDING },
      });

      await expect(
        cartService.addToCart(mockUserId, addToCartData)
      ).rejects.toThrow("Store is not available");
    });

    it("should throw error when insufficient stock", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        quantity: 1,
      });

      await expect(
        cartService.addToCart(mockUserId, {
          productId: mockProductId,
          quantity: 5,
        })
      ).rejects.toThrow("Only 1 items available in stock");
    });

    it("should throw error when updating would exceed stock", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        quantity: 5,
      });
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        ...mockCartItem,
        quantity: 3,
      });

      await expect(
        cartService.addToCart(mockUserId, {
          productId: mockProductId,
          quantity: 3,
        })
      ).rejects.toThrow("Only 5 items available in stock");
    });
  });

  describe("updateCartItem", () => {
    const updateData = { quantity: 5 };

    it("should update cart item quantity", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        ...mockCartItem,
        product: mockProduct,
      });
      (prisma.cartItem.update as any).mockResolvedValue({
        ...mockCartItem,
        quantity: 5,
      });

      await cartService.updateCartItem(mockUserId, mockProductId, updateData);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: mockCartItemId },
        data: { quantity: 5 },
      });
    });

    it("should delete item when quantity is 0", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        ...mockCartItem,
        product: mockProduct,
      });
      (prisma.cartItem.delete as any).mockResolvedValue(mockCartItem);

      await cartService.updateCartItem(mockUserId, mockProductId, {
        quantity: 0,
      });

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: mockCartItemId },
      });

      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });

    it("should throw error when item not found in cart", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);

      await expect(
        cartService.updateCartItem(mockUserId, mockProductId, updateData)
      ).rejects.toThrow("Item not found in cart");
    });

    it("should throw error when insufficient stock for update", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue({
        ...mockCartItem,
        product: { ...mockProduct, quantity: 3 },
      });

      await expect(
        cartService.updateCartItem(mockUserId, mockProductId, { quantity: 5 })
      ).rejects.toThrow("Only 3 items available in stock");
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue(mockCartItem);
      (prisma.cartItem.delete as any).mockResolvedValue(mockCartItem);

      const result = await cartService.removeFromCart(
        mockUserId,
        mockProductId
      );

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: mockCartItemId },
      });

      expect(result.userId).toBe(mockUserId);
    });

    it("should throw error when item not found in cart", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
      (prisma.cartItem.findUnique as any).mockResolvedValue(null);

      await expect(
        cartService.removeFromCart(mockUserId, mockProductId)
      ).rejects.toThrow("Item not found in cart");

      expect(prisma.cartItem.delete).not.toHaveBeenCalled();
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", async () => {
      (prisma.cart.findUnique as any)
        .mockResolvedValueOnce(mockCart) // First call
        .mockResolvedValueOnce({ ...mockCart, items: [] }); // After clearing
      (prisma.cartItem.deleteMany as any).mockResolvedValue({ count: 2 });

      const result = await cartService.clearCart(mockUserId);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCartId },
      });

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should handle empty cart gracefully", async () => {
      const emptyCart = { ...mockCart, items: [] };
      (prisma.cart.findUnique as any).mockResolvedValue(emptyCart);
      (prisma.cartItem.deleteMany as any).mockResolvedValue({ count: 0 });

      const result = await cartService.clearCart(mockUserId);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
      expect(result.items).toHaveLength(0);
    });
  });

  describe("getCartSummary", () => {
    it("should return cart summary with store breakdown", async () => {
      const store2Id = faker.string.uuid();
      const multiStoreCart = {
        ...mockCart,
        items: [
          mockCartItem,
          {
            ...mockCartItem,
            id: faker.string.uuid(),
            productId: faker.string.uuid(),
            quantity: 3,
            product: {
              ...mockProduct,
              id: faker.string.uuid(),
              price: new Decimal("25.00"),
              store: {
                id: store2Id,
                name: faker.company.name(),
                slug: faker.internet.domainWord(),
              },
            },
          },
        ],
      };

      (prisma.cart.findUnique as any).mockResolvedValue(multiStoreCart);

      const result = await cartService.getCartSummary(mockUserId);

      expect(result.summary).toBeDefined();
      expect(result.summary.itemCount).toBe(5); // 2 + 3
      expect(result.summary.uniqueItems).toBe(2);
      expect(result.summary.storeBreakdown).toHaveLength(2);

      const storeBreakdown = result.summary.storeBreakdown;
      expect(storeBreakdown[0]).toHaveProperty("storeId");
      expect(storeBreakdown[0]).toHaveProperty("storeName");
      expect(storeBreakdown[0]).toHaveProperty("items");
      expect(storeBreakdown[0]).toHaveProperty("subtotal");
    });

    it("should handle empty cart summary", async () => {
      const emptyCart = { ...mockCart, items: [] };
      (prisma.cart.findUnique as any).mockResolvedValue(emptyCart);

      const result = await cartService.getCartSummary(mockUserId);

      expect(result.summary.itemCount).toBe(0);
      expect(result.summary.uniqueItems).toBe(0);
      expect(result.summary.subtotal).toBe(0);
      expect(result.summary.storeBreakdown).toHaveLength(0);
    });

    it("should calculate correct totals for each store", async () => {
      const multiItemSameStore = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            quantity: 2,
            product: { ...mockProduct, price: new Decimal("10.00") },
          },
          {
            ...mockCartItem,
            id: faker.string.uuid(),
            quantity: 3,
            product: {
              ...mockProduct,
              id: faker.string.uuid(),
              price: new Decimal("20.00"),
            },
          },
        ],
      };

      (prisma.cart.findUnique as any).mockResolvedValue(multiItemSameStore);

      const result = await cartService.getCartSummary(mockUserId);

      expect(result.summary.subtotal).toBe(80); // (2 * 10) + (3 * 20)
      expect(result.summary.storeBreakdown).toHaveLength(1);
      expect(result.summary.storeBreakdown[0].subtotal).toBe(80);
    });
  });
});
