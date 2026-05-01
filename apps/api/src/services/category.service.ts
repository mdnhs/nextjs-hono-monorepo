import { BaseService } from './base.service'
import { prisma } from '../utils/prisma'

export class CategoryService extends BaseService {
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    return categories
  }
  
  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    if (!category) {
      throw new Error('Category not found')
    }
    
    return category
  }
}

export const categoryService = new CategoryService()