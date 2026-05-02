import { Hono } from 'hono'
import authRouter from './routes/auth'
import storesRouter from './routes/stores'
import productsRouter from './routes/products'
import cartRouter from './routes/cart'
import ordersRouter from './routes/orders'
import reviewsRouter from './routes/reviews'
import categoryRoutes from './routes/category.routes'
import planRouter from './routes/plans'
import adminRouter from './routes/admin'

// Create API app for type export
const api = new Hono()
  .get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }))
  .route('/auth', authRouter)
  .route('/stores', storesRouter)
  .route('/products', productsRouter)
  .route('/cart', cartRouter)
  .route('/orders', ordersRouter)
  .route('/reviews', reviewsRouter)
  .route('/categories', categoryRoutes)
  .route('/plans', planRouter)
  .route('/admin', adminRouter)

export type ApiType = typeof api

export default api