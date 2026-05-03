import { db } from '../db'
import { products, productVariants, stores, categories, reviews } from '../db/schema'
import type { UserRole } from '../db/schema'
import { eq, and, or, gte, lte, ilike, desc, count, avg, sql } from 'drizzle-orm'
import { BaseService } from './base.service'
import { toCents, centsToNumericString } from '../utils/money'
import { revalidateNext, tagFor } from '../utils/revalidate'

export interface CreateProductData {
  name: string
  description?: string
  price: number
  images?: string[]
  sku: string
  quantity: number
  categoryId?: string
  isActive?: boolean
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  images?: string[]
  sku?: string
  quantity?: number
  categoryId?: string
  isActive?: boolean
}

export interface ProductFilters {
  storeId?: string
  categoryId?: string
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
  includeUnpublishedStores?: boolean
  ownerId?: string
}

export class ProductService extends BaseService {
  async getAllProducts(filters: ProductFilters, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)

    const conditions: any[] = []

    if (filters.storeId) conditions.push(eq(products.storeId, filters.storeId))
    if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId))
    if (filters.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive))
    if (filters.minPrice !== undefined) conditions.push(gte(products.price, String(filters.minPrice)))
    if (filters.maxPrice !== undefined) conditions.push(lte(products.price, String(filters.maxPrice)))
    if (filters.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`),
          ilike(products.sku, `%${filters.search}%`)
        )
      )
    }

    // Store status filter via join
    const storeConditions: any[] = []
    if (filters.ownerId) {
      storeConditions.push(eq(stores.ownerId, filters.ownerId))
      if (!filters.includeUnpublishedStores) {
        storeConditions.push(eq(stores.status, 'APPROVED'))
      }
    } else if (!filters.includeUnpublishedStores) {
      storeConditions.push(eq(stores.status, 'APPROVED'))
    }

    const allConditions = [...conditions, ...storeConditions]
    const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          images: products.images,
          sku: products.sku,
          quantity: products.quantity,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          storeId: products.storeId,
          categoryId: products.categoryId,
          store: {
            id: stores.id,
            name: stores.name,
            slug: stores.slug,
          },
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(products)
        .innerJoin(stores, eq(products.storeId, stores.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(skip),
      db
        .select({ total: count() })
        .from(products)
        .innerJoin(stores, eq(products.storeId, stores.id))
        .where(whereClause),
    ])

    const productIds = rows.map((p) => p.id)
    const ratingsMap = new Map<string, { average: number; count: number }>()

    if (productIds.length > 0) {
      const ratingRows = await db
        .select({
          productId: reviews.productId,
          avgRating: avg(reviews.rating),
          countRating: count(),
        })
        .from(reviews)
        .where(sql`${reviews.productId} IN (${sql.join(productIds.map((id) => sql`${id}`), sql`, `)})`)
        .groupBy(reviews.productId)

      for (const r of ratingRows) {
        ratingsMap.set(r.productId, {
          average: r.avgRating ? Number(r.avgRating) : 0,
          count: Number(r.countRating),
        })
      }
    }

    const data = rows.map((p) => ({
      ...p,
      rating: ratingsMap.get(p.id) ?? { average: 0, count: 0 },
    }))

    return this.formatPaginatedResult(data, Number(total), page, limit)
  }

  async getProductById(id: string) {
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        images: products.images,
        sku: products.sku,
        quantity: products.quantity,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        storeId: products.storeId,
        categoryId: products.categoryId,
        store: {
          id: stores.id,
          name: stores.name,
          slug: stores.slug,
          status: stores.status,
          ownerId: stores.ownerId,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))

    if (!row) {
      throw new Error('Product not found')
    }

    const [ratingRow] = await db
      .select({ avgRating: avg(reviews.rating), countRating: count() })
      .from(reviews)
      .where(eq(reviews.productId, id))

    return {
      ...row,
      rating: {
        average: ratingRow?.avgRating ? Number(ratingRow.avgRating) : 0,
        count: Number(ratingRow?.countRating ?? 0),
      },
    }
  }

  async getProductBySku(sku: string) {
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        images: products.images,
        sku: products.sku,
        quantity: products.quantity,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        storeId: products.storeId,
        categoryId: products.categoryId,
        store: {
          id: stores.id,
          name: stores.name,
          slug: stores.slug,
          status: stores.status,
          ownerId: stores.ownerId,
        },
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.sku, sku))

    if (!row) {
      throw new Error('Product not found')
    }

    return row
  }

  async getStoreProducts(storeId: string, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)

    const where = and(eq(products.storeId, storeId), eq(products.isActive, true))

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          images: products.images,
          sku: products.sku,
          quantity: products.quantity,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          storeId: products.storeId,
          categoryId: products.categoryId,
          category: {
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(skip),
      db.select({ total: count() }).from(products).where(where),
    ])

    return this.formatPaginatedResult(rows, Number(total), page, limit)
  }

  async createProduct(storeId: string, data: CreateProductData, userId: string, userRole: UserRole) {
    const store = await db.query.stores.findFirst({ where: eq(stores.id, storeId) })

    if (!store) {
      throw new Error('Store not found')
    }

    if (store.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
      throw new Error('Not authorized to add products to this store')
    }

    const existing = await db.query.products.findFirst({ where: eq(products.sku, data.sku) })
    if (existing) {
      throw new Error('SKU already exists')
    }

    if (data.categoryId) {
      const cat = await db.query.categories.findFirst({ where: eq(categories.id, data.categoryId) })
      if (!cat) {
        throw new Error('Category not found')
      }
    }

    const priceCents = toCents(data.price)
    const currency = store.currency ?? 'USD'

    const product = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          ...data,
          price: centsToNumericString(priceCents),
          priceCents,
          currency,
          storeId,
          images: data.images || [],
        })
        .returning()

      await tx.insert(productVariants).values({
        productId: created.id,
        sku: data.sku,
        priceCents,
        currency,
        price: centsToNumericString(priceCents),
        quantity: data.quantity,
        isDefault: true,
        position: 0,
      })

      return created
    })

    await revalidateNext([tagFor.products(storeId)])
    return this.getProductById(product.id)
  }

  async updateProduct(id: string, data: UpdateProductData, userId: string, userRole: UserRole) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { store: true },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.store.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
      throw new Error('Not authorized to update this product')
    }

    if (data.sku && data.sku !== product.sku) {
      const existing = await db.query.products.findFirst({ where: eq(products.sku, data.sku) })
      if (existing) {
        throw new Error('SKU already exists')
      }
    }

    if (data.categoryId) {
      const cat = await db.query.categories.findFirst({ where: eq(categories.id, data.categoryId) })
      if (!cat) {
        throw new Error('Category not found')
      }
    }

    const updateData: Record<string, unknown> = { ...data }
    let priceCents: bigint | undefined
    if (data.price !== undefined) {
      priceCents = toCents(data.price)
      updateData.price = centsToNumericString(priceCents)
      updateData.priceCents = priceCents
    }

    await db.transaction(async (tx) => {
      await tx.update(products).set(updateData as any).where(eq(products.id, id))

      const variantPatch: Record<string, unknown> = {}
      if (priceCents !== undefined) {
        variantPatch.priceCents = priceCents
        variantPatch.price = centsToNumericString(priceCents)
      }
      if (data.sku !== undefined) variantPatch.sku = data.sku
      if (data.quantity !== undefined) variantPatch.quantity = data.quantity
      if (Object.keys(variantPatch).length > 0) {
        await tx
          .update(productVariants)
          .set(variantPatch)
          .where(and(eq(productVariants.productId, id), eq(productVariants.isDefault, true)))
      }
    })

    await revalidateNext([tagFor.products(product.storeId)])
    return this.getProductById(id)
  }

  async deleteProduct(id: string, userId: string, userRole: UserRole) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { store: true },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.store.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
      throw new Error('Not authorized to delete this product')
    }

    await db.delete(products).where(eq(products.id, id))

    await revalidateNext([tagFor.products(product.storeId)])
    return { message: 'Product deleted successfully' }
  }

  async updateInventory(id: string, quantity: number, userId: string, userRole: UserRole) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { store: true },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.store.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
      throw new Error('Not authorized to update inventory')
    }

    if (quantity < 0) {
      throw new Error('Quantity cannot be negative')
    }

    const [updated] = await db.transaction(async (tx) => {
      await tx
        .update(productVariants)
        .set({ quantity })
        .where(and(eq(productVariants.productId, id), eq(productVariants.isDefault, true)))
      return tx.update(products).set({ quantity }).where(eq(products.id, id)).returning()
    })

    return { ...updated, store: { id: product.store.id, name: product.store.name, slug: product.store.slug } }
  }

  async toggleProductStatus(id: string, userId: string, userRole: UserRole) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: { store: true },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.store.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
      throw new Error('Not authorized to update product status')
    }

    const [updated] = await db
      .update(products)
      .set({ isActive: !product.isActive })
      .where(eq(products.id, id))
      .returning()

    return { ...updated, store: { id: product.store.id, name: product.store.name, slug: product.store.slug } }
  }

  async getSellerProducts(
    ownerId: string,
    filters: Omit<ProductFilters, 'ownerId'> = {},
    pagination: { page: number; limit: number }
  ) {
    return this.getAllProducts({ ...filters, ownerId, includeUnpublishedStores: true }, pagination)
  }
}

export const productService = new ProductService()
