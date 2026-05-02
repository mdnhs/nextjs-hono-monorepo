import { BaseService } from './base.service'
import { db } from '../db'
import { categories, products } from '../db/schema'
import { asc, eq, count } from 'drizzle-orm'

export class CategoryService extends BaseService {
  async getAllCategories() {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id)
      .orderBy(asc(categories.name))

    return rows.map((r) => ({
      ...r,
      _count: { products: Number(r.productCount) },
    }))
  }

  async getCategoryBySlug(slug: string) {
    const [row] = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(eq(categories.slug, slug))
      .groupBy(categories.id)

    if (!row) {
      throw new Error('Category not found')
    }

    return { ...row, _count: { products: Number(row.productCount) } }
  }
}

export const categoryService = new CategoryService()
