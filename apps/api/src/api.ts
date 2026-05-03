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

import paymentsRouter from './routes/payments'
import inventoryRouter from './routes/inventory'
import webhooksRouter from './routes/webhooks'

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
  .route('/payments', paymentsRouter)
  .route('/inventory', inventoryRouter)
  .route('/webhooks', webhooksRouter)

export type ApiType = typeof api

export default api