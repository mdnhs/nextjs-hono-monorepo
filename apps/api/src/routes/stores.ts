import { Hono } from 'hono'
import { storeController } from '../controllers/store.controller'
import { productController } from '../controllers/product.controller'
import { orderController } from '../controllers/order.controller'
import { authenticate, authorize } from '../middlewares/auth'
import { UserRole } from '@prisma/client'

const storesRouter = new Hono()

storesRouter.get('/', (c) => storeController.getAllStores(c))
storesRouter.get('/my/stores', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => storeController.getUserStores(c))
storesRouter.get('/:id', (c) => storeController.getStoreById(c))
storesRouter.get('/slug/:slug', (c) => storeController.getStoreBySlug(c))

storesRouter.post('/', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => storeController.createStore(c))
storesRouter.patch('/:id', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => storeController.updateStore(c))
storesRouter.delete('/:id', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => storeController.deleteStore(c))

storesRouter.post('/:id/publish', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => storeController.publishStore(c))
storesRouter.post('/:id/unpublish', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => storeController.unpublishStore(c))

storesRouter.get('/:storeId/products', (c) => productController.getStoreProducts(c))
storesRouter.post('/:storeId/products', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => productController.createProduct(c))
storesRouter.get('/:storeId/orders', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => orderController.getStoreOrders(c))

export default storesRouter