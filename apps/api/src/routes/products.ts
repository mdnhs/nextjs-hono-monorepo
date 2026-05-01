import { Hono } from 'hono'
import { productController } from '../controllers/product.controller'
import { authenticate, authorize } from '../middlewares/auth'
import { UserRole } from '@prisma/client'

const productsRouter = new Hono()

productsRouter.get('/', (c) => productController.getAllProducts(c))
productsRouter.get('/my', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => productController.getSellerProducts(c))
productsRouter.get('/:id', (c) => productController.getProductById(c))
productsRouter.get('/sku/:sku', (c) => productController.getProductBySku(c))

productsRouter.patch('/:id', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => productController.updateProduct(c))
productsRouter.delete('/:id', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => productController.deleteProduct(c))

productsRouter.patch('/:id/inventory', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => productController.updateInventory(c))
productsRouter.patch('/:id/toggle-status', authenticate, authorize(UserRole.SELLER, UserRole.ADMIN), (c) => productController.toggleProductStatus(c))

export default productsRouter