import { Hono } from 'hono'
import { storeController } from '../controllers/store.controller'
import { productController } from '../controllers/product.controller'
import { orderController } from '../controllers/order.controller'
import { authenticate, authorize } from '../middlewares/auth'

const storesRouter = new Hono()

storesRouter.get('/', (c) => storeController.getAllStores(c))
storesRouter.get('/my', authenticate, authorize('SELLER', 'ADMIN'), (c) => storeController.getUserStores(c))
storesRouter.get('/:id', (c) => storeController.getStoreById(c))
storesRouter.get('/slug/:slug', (c) => storeController.getStoreBySlug(c))

storesRouter.post('/', authenticate, authorize('SELLER', 'ADMIN'), (c) => storeController.createStore(c))
storesRouter.patch('/:id', authenticate, authorize('SELLER', 'ADMIN'), (c) => storeController.updateStore(c))
storesRouter.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), (c) => storeController.deleteStore(c))

// Subscription management
storesRouter.get('/:id/subscription', authenticate, (c) => storeController.getStoreSubscription(c))
storesRouter.post('/:id/subscription/cancel', authenticate, (c) => storeController.cancelSubscription(c))
storesRouter.post('/:id/subscription/upgrade', authenticate, (c) => storeController.upgradeSubscription(c))
storesRouter.get('/:id/limits', authenticate, (c) => storeController.getStoreLimits(c))

// Store products
storesRouter.get('/:storeId/products', (c) => productController.getStoreProducts(c))
storesRouter.post('/:storeId/products', authenticate, authorize('SELLER', 'ADMIN'), (c) => productController.createProduct(c))

// Store orders
storesRouter.get('/:storeId/orders', authenticate, authorize('SELLER', 'ADMIN'), (c) => orderController.getStoreOrders(c))

export default storesRouter
