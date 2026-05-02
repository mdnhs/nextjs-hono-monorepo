import { Hono } from 'hono'
import { productController } from '../controllers/product.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireProductOwnership } from '../middlewares/rbac'
import { enforceProductLimit } from '../middlewares/limits'

const productsRouter = new Hono()

productsRouter.get('/', (c) => productController.getAllProducts(c))
productsRouter.get('/my', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), (c) => productController.getSellerProducts(c))
productsRouter.get('/:id', (c) => productController.getProductById(c))
productsRouter.get('/sku/:sku', (c) => productController.getProductBySku(c))
productsRouter.post('/', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), enforceProductLimit, (c) => productController.createProduct(c))

productsRouter.patch('/:id', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), requireProductOwnership, (c) => productController.updateProduct(c))
productsRouter.delete('/:id', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), requireProductOwnership, (c) => productController.deleteProduct(c))

productsRouter.patch('/:id/inventory', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), requireProductOwnership, (c) => productController.updateInventory(c))
productsRouter.patch('/:id/toggle-status', authenticate, requirePermission(PERMISSIONS.SELLER_PRODUCTS_MANAGE), requireProductOwnership, (c) => productController.toggleProductStatus(c))

export default productsRouter