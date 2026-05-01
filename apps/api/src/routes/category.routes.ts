import { Hono } from 'hono'
import { categoryController } from '../controllers/category.controller'

const categoryRoutes = new Hono()

// Public routes
categoryRoutes.get('/', (c) => categoryController.getAllCategories(c))
categoryRoutes.get('/slug/:slug', (c) => categoryController.getCategoryBySlug(c))

export default categoryRoutes