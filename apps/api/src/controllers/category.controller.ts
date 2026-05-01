import { Context } from 'hono'
import { BaseController } from './base.controller'
import { categoryService } from '../services/category.service'

export class CategoryController extends BaseController {
  async getAllCategories(c: Context) {
    try {
      const categories = await categoryService.getAllCategories()
      return c.json(categories)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getCategoryBySlug(c: Context) {
    try {
      const slug = c.req.param('slug')!
      const category = await categoryService.getCategoryBySlug(slug)
      return c.json(category)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const categoryController = new CategoryController()