import { Hono } from 'hono'
import { cartController } from '../controllers/cart.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS } from '../middlewares/rbac'

const cartRouter = new Hono()

cartRouter.use(authenticate)

cartRouter.get('/', requirePermission(PERMISSIONS.BUYER_CART), (c) => cartController.getCart(c))
cartRouter.get('/summary', requirePermission(PERMISSIONS.BUYER_CART), (c) => cartController.getCartSummary(c))
cartRouter.post('/items', requirePermission(PERMISSIONS.BUYER_CART), (c) => cartController.addToCart(c))
cartRouter.patch('/items/:productId', requirePermission(PERMISSIONS.BUYER_CART), (c) => cartController.updateCartItem(c))
cartRouter.delete('/items/:productId', requirePermission(PERMISSIONS.BUYER_CART), (c) => cartController.removeFromCart(c))
cartRouter.delete('/clear', requirePermission(PERMISSIONS.BUYER_CART), (c) => cartController.clearCart(c))

export default cartRouter