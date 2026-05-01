import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { BaseService } from "./base.service";

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  sku: string;
  quantity: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  sku?: string;
  quantity?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  storeId?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  includeUnpublishedStores?: boolean;
  ownerId?: string; // Filter by store owner
}

export class ProductService extends BaseService {
  async getAllProducts(
    filters: ProductFilters,
    pagination: { page: number; limit: number }
  ) {
    const { page, limit, skip } = this.getPaginationParams(pagination);

    const where: Prisma.ProductWhereInput = {
      ...(filters.storeId && { storeId: filters.storeId }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.minPrice !== undefined && filters.maxPrice !== undefined && {
        price: { gte: filters.minPrice, lte: filters.maxPrice },
      }),
      ...(filters.minPrice !== undefined && filters.maxPrice === undefined && {
        price: { gte: filters.minPrice },
      }),
      ...(filters.maxPrice !== undefined && filters.minPrice === undefined && {
        price: { lte: filters.maxPrice },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { sku: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
      ...(filters.ownerId && {
        store: { 
          ownerId: filters.ownerId,
          ...(filters.includeUnpublishedStores ? {} : { status: 'PUBLISHED' })
        }
      }),
      ...(!filters.ownerId && !filters.includeUnpublishedStores && {
        store: { status: 'PUBLISHED' }
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
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
              reviews: true
            }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const reviews = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
          _count: { rating: true }
        })
        
        return {
          ...product,
          rating: {
            average: reviews._avg.rating || 0,
            count: reviews._count.rating
          }
        }
      })
    );

    return this.formatPaginatedResult(productsWithRatings, total, page, limit);
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
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
            reviews: true
          }
        }
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }
    
    const reviews = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return {
      ...product,
      rating: {
        average: reviews._avg.rating || 0,
        count: reviews._count.rating
      }
    };
  }

  async getProductBySku(sku: string) {
    const product = await prisma.product.findUnique({
      where: { sku },
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

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async getStoreProducts(
    storeId: string,
    pagination: { page: number; limit: number }
  ) {
    const { page, limit, skip } = this.getPaginationParams(pagination);

    const where = { storeId, isActive: true };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    return this.formatPaginatedResult(products, total, page, limit);
  }

  async createProduct(
    storeId: string,
    data: CreateProductData,
    userId: string,
    userRole: UserRole
  ) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error("Store not found");
    }

    if (store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error("Not authorized to add products to this store");
    }

    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new Error("SKU already exists");
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("Category not found");
      }
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        storeId,
        images: data.images || [],
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

    return product;
  }

  async updateProduct(
    id: string,
    data: UpdateProductData,
    userId: string,
    userRole: UserRole
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error("Not authorized to update this product");
    }

    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingProduct) {
        throw new Error("SKU already exists");
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("Category not found");
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
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

    return updatedProduct;
  }

  async deleteProduct(id: string, userId: string, userRole: UserRole) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error("Not authorized to delete this product");
    }

    await prisma.product.delete({
      where: { id },
    });

    return { message: "Product deleted successfully" };
  }

  async updateInventory(
    id: string,
    quantity: number,
    userId: string,
    userRole: UserRole
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error("Not authorized to update inventory");
    }

    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { quantity },
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

    return updatedProduct;
  }

  async toggleProductStatus(id: string, userId: string, userRole: UserRole) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error("Not authorized to update product status");
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
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

    return updatedProduct;
  }

  // Get all products owned by a specific user (across all their stores)
  async getSellerProducts(
    ownerId: string,
    filters: Omit<ProductFilters, 'ownerId'> = {},
    pagination: { page: number; limit: number }
  ) {
    return this.getAllProducts(
      { 
        ...filters, 
        ownerId, 
        includeUnpublishedStores: true // Sellers should see their own draft store products
      },
      pagination
    );
  }
}

export const productService = new ProductService();
