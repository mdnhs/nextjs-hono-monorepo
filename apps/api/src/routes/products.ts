import { Hono } from 'hono'
import { productController } from '../controllers/product.controller'
import { authenticate, authorize } from '../middlewares/auth'

const productsRouter = new Hono()

productsRouter.get('/', (c) => productController.getAllProducts(c))
productsRouter.get('/my', authenticate, authorize('SELLER', 'ADMIN'), (c) => productController.getSellerProducts(c))
productsRouter.get('/:id', (c) => productController.getProductById(c))
productsRouter.get('/sku/:sku', (c) => productController.getProductBySku(c))

productsRouter.patch('/:id', authenticate, authorize('SELLER', 'ADMIN'), (c) => productController.updateProduct(c))
productsRouter.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), (c) => productController.deleteProduct(c))

productsRouter.patch('/:id/inventory', authenticate, authorize('SELLER', 'ADMIN'), (c) => productController.updateInventory(c))
productsRouter.patch('/:id/toggle-status', authenticate, authorize('SELLER', 'ADMIN'), (c) => productController.toggleProductStatus(c))

export default productsRouter