import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProductService } from "../product.service";
import { db } from '../../db';
import { faker } from "@faker-js/faker";

vi.mock('../../db');

// TODO: These tests were written for Prisma and need rewriting for Drizzle
const prisma = db as any

describe("ProductService", () => {
  let productService: ProductService;
  const mockUserId = faker.string.uuid();
  const mockStoreId = faker.string.uuid();
  const mockProductId = faker.string.uuid();

  const mockStore = {
    id: mockStoreId,
    name: faker.company.name(),
    slug: faker.internet.domainWord(),
    ownerId: mockUserId,
    status: "PUBLISHED",
  };

  const mockProduct = {
    id: mockProductId,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    sku: faker.string.alphanumeric(10).toUpperCase(),
    quantity: faker.number.int({ min: 0, max: 100 }),
    isActive: true,
    storeId: mockStoreId,
    categoryId: null,
    images: [faker.image.url()],
    createdAt: new Date(),
    updatedAt: new Date(),
    store: mockStore,
    category: null,
    _count: { reviews: 5 },
  };

  beforeEach(() => {
    productService = new ProductService();
    vi.clearAllMocks();
  });

  describe("getAllProducts", () => {
    it("should return paginated products with filters", async () => {
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      (prisma.product.findMany as any).mockResolvedValue(mockProducts);
      (prisma.product.count as any).mockResolvedValue(mockTotal);
      (prisma.review.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 10 },
        _sum: { rating: null },
        _min: { rating: null },
        _max: { rating: null },
      });

      const filters = {
        isActive: true,
        minPrice: 10,
        maxPrice: 100,
        search: "test",
      };

      const pagination = { page: 1, limit: 10 };
      const result = await productService.getAllProducts(filters, pagination);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          price: { gte: 10, lte: 100 },
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { description: { contains: "test", mode: "insensitive" } },
            { sku: { contains: "test", mode: "insensitive" } },
          ],
          store: { status: "PUBLISHED" },
        },
        skip: 0,
        take: 10,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty("rating");
      expect(result.pagination.total).toBe(mockTotal);
    });

    it("should handle empty results", async () => {
      (prisma.product.findMany as any).mockResolvedValue([]);
      (prisma.product.count as any).mockResolvedValue(0);

      const result = await productService.getAllProducts(
        {},
        { page: 1, limit: 10 }
      );

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getProductById", () => {
    it("should return a product by id with rating", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct as any);
      (prisma.review.aggregate as any).mockResolvedValue({
        _avg: { rating: 4.2 },
        _count: { rating: 8 },
        _sum: { rating: null },
        _min: { rating: null },
        _max: { rating: null },
      });

      const result = await productService.getProductById(mockProductId);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: {
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
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      expect(result).toMatchObject({
        ...mockProduct,
        rating: {
          average: 4.2,
          count: 8,
        },
      });
    });

    it("should throw error when product not found", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(productService.getProductById("invalid-id")).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("createProduct", () => {
    const createProductData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      quantity: faker.number.int({ min: 0, max: 100 }),
      images: [faker.image.url()],
    };

    it("should create a product when user is store owner", async () => {
      (prisma.store.findUnique as any).mockResolvedValue(mockStore as any);
      (prisma.product.findUnique as any).mockResolvedValue(null);
      (prisma.product.create as any).mockResolvedValue({
        ...mockProduct,
        ...createProductData,
        price: createProductData.price,
      } as any);

      const result = await productService.createProduct(
        mockStoreId,
        createProductData,
        mockUserId,
        'SELLER'
      );

      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockStoreId },
      });

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductData,
          storeId: mockStoreId,
          images: createProductData.images,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      expect(result.name).toBe(createProductData.name);
      expect(result.description).toBe(createProductData.description);
      expect(result.sku).toBe(createProductData.sku);
      expect(result.quantity).toBe(createProductData.quantity);
    });

    it("should create a product when user is admin", async () => {
      const differentUserId = faker.string.uuid();
      (prisma.store.findUnique as any).mockResolvedValue({
        ...mockStore,
        ownerId: differentUserId,
      } as any);
      (prisma.product.findUnique as any).mockResolvedValue(null);
      (prisma.product.create as any).mockResolvedValue({
        ...mockProduct,
        ...createProductData,
        price: createProductData.price,
      } as any);

      const result = await productService.createProduct(
        mockStoreId,
        createProductData,
        mockUserId,
        'ADMIN'
      );

      expect(result.name).toBe(createProductData.name);
      expect(result.description).toBe(createProductData.description);
      expect(result.sku).toBe(createProductData.sku);
      expect(result.quantity).toBe(createProductData.quantity);
    });

    it("should throw error when store not found", async () => {
      (prisma.store.findUnique as any).mockResolvedValue(null);

      await expect(
        productService.createProduct(
          mockStoreId,
          createProductData,
          mockUserId,
          'SELLER'
        )
      ).rejects.toThrow("Store not found");
    });

    it("should throw error when SKU already exists", async () => {
      (prisma.store.findUnique as any).mockResolvedValue(mockStore as any);
      (prisma.product.findUnique as any).mockResolvedValue(mockProduct as any);

      await expect(
        productService.createProduct(
          mockStoreId,
          createProductData,
          mockUserId,
          'SELLER'
        )
      ).rejects.toThrow("SKU already exists");
    });

    it("should throw error when user not authorized", async () => {
      const differentUserId = faker.string.uuid();
      (prisma.store.findUnique as any).mockResolvedValue({
        ...mockStore,
        ownerId: differentUserId,
      } as any);

      await expect(
        productService.createProduct(
          mockStoreId,
          createProductData,
          mockUserId,
          'SELLER'
        )
      ).rejects.toThrow("Not authorized to add products to this store");
    });
  });

  describe("updateProduct", () => {
    const updateData = {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
    };

    it("should update a product when user is owner", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: mockStore,
      } as any);
      (prisma.product.update as any).mockResolvedValue({
        ...mockProduct,
        ...updateData,
        price: updateData.price,
      } as any);

      const result = await productService.updateProduct(
        mockProductId,
        updateData,
        mockUserId,
        'SELLER'
      );

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: updateData,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      expect(result.name).toBe(updateData.name);
    });

    it("should throw error when product not found", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(
        productService.updateProduct(
          mockProductId,
          updateData,
          mockUserId,
          'SELLER'
        )
      ).rejects.toThrow("Product not found");
    });

    it("should throw error when user not authorized", async () => {
      const differentUserId = faker.string.uuid();
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: { ...mockStore, ownerId: differentUserId },
      } as any);

      await expect(
        productService.updateProduct(
          mockProductId,
          updateData,
          mockUserId,
          'SELLER'
        )
      ).rejects.toThrow("Not authorized to update this product");
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product when user is owner", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: mockStore,
      } as any);
      (prisma.product.delete as any).mockResolvedValue(mockProduct as any);

      const result = await productService.deleteProduct(
        mockProductId,
        mockUserId,
        'SELLER'
      );

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: mockProductId },
      });

      expect(result).toEqual({ message: "Product deleted successfully" });
    });

    it("should throw error when product not found", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(
        productService.deleteProduct(mockProductId, mockUserId, 'SELLER')
      ).rejects.toThrow("Product not found");
    });
  });

  describe("updateInventory", () => {
    it("should update product inventory", async () => {
      const newQuantity = 50;
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: mockStore,
      } as any);
      (prisma.product.update as any).mockResolvedValue({
        ...mockProduct,
        quantity: newQuantity,
      } as any);

      const result = await productService.updateInventory(
        mockProductId,
        newQuantity,
        mockUserId,
        'SELLER'
      );

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: { quantity: newQuantity },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      expect(result.quantity).toBe(newQuantity);
    });

    it("should throw error for negative quantity", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: mockStore,
      } as any);

      await expect(
        productService.updateInventory(
          mockProductId,
          -5,
          mockUserId,
          'SELLER'
        )
      ).rejects.toThrow("Quantity cannot be negative");
    });
  });

  describe("toggleProductStatus", () => {
    it("should toggle product active status", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({
        ...mockProduct,
        store: mockStore,
      } as any);
      (prisma.product.update as any).mockResolvedValue({
        ...mockProduct,
        isActive: false,
      } as any);

      const result = await productService.toggleProductStatus(
        mockProductId,
        mockUserId,
        'SELLER'
      );

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: { isActive: false },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      expect(result.isActive).toBe(false);
    });
  });
});
