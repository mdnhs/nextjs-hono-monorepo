import { Hono } from 'hono'
import { storeController } from '../controllers/store.controller'
import { productController } from '../controllers/product.controller'
import { orderController } from '../controllers/order.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireStoreOwnership } from '../middlewares/rbac'

const storesRouter = new Hono()

storesRouter.get('/', (c) => storeController.getAllStores(c))
storesRouter.get('/my', authenticate, requirePermission(PERMISSIONS.SELLER_DASHBOARD), (c) => storeController.getUserStores(c))
storesRouter.get('/:id', (c) => storeController.getStoreById(c))
storesRouter.get('/slug/:slug', (c) => storeController.getStoreBySlug(c))

storesRouter.post('/', authenticate, requirePermission(PERMISSIONS.SELLER_STORES_MANAGE), (c) => storeController.createStore(c))
storesRouter.patch('/:id', authenticate, requirePermission(PERMISSIONS.SELLER_STORES_MANAGE), requireStoreOwnership, (c) => storeController.updateStore(c))
storesRouter.delete('/:id', authenticate, requirePermission(PERMISSIONS.SELLER_STORES_MANAGE), requireStoreOwnership, (c) => storeController.deleteStore(c))

// Subscription management
storesRouter.get('/:id/subscription', authenticate, requirePermission(PERMISSIONS.SELLER_SUBSCRIPTION_MANAGE), requireStoreOwnership, (c) => storeController.getStoreSubscription(c))
storesRouter.post('/:id/subscription/cancel', authenticate, requirePermission(PERMISSIONS.SELLER_SUBSCRIPTION_MANAGE), requireStoreOwnership, (c) => storeController.cancelSubscription(c))
storesRouter.post('/:id/subscription/upgrade', authenticate, requirePermission(PERMISSIONS.SELLER_SUBSCRIPTION_MANAGE), requireStoreOwnership, (c) => storeController.upgradeSubscription(c))
storesRouter.get('/:id/limits', authenticate, requirePermission(PERMISSIONS.SELLER_STORES_MANAGE), requireStoreOwnership, (c) => storeController.getStoreLimits(c))

// Store products
storesRouter.get('/:storeId/products', (c) => productController.getStoreProducts(c))
storesRouter.post('/:storeId/products', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), requireStoreOwnership, (c) => productController.createProduct(c))

// Store orders
storesRouter.get('/:storeId/orders', authenticate, requirePermission(PERMISSIONS.SELLER_ORDERS_MANAGE), requireStoreOwnership, (c) => orderController.getStoreOrders(c))

export default storesRouter
