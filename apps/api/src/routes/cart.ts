import { Hono } from 'hono'
import { cartController } from '../controllers/cart.controller'
import { authenticate } from '../middlewares/auth'

const cartRouter = new Hono()

cartRouter.use('*', authenticate)

cartRouter.get('/', (c) => cartController.getCart(c))
cartRouter.get('/summary', (c) => cartController.getCartSummary(c))
cartRouter.post('/items', (c) => cartController.addToCart(c))
cartRouter.patch('/items/:productId', (c) => cartController.updateCartItem(c))
cartRouter.delete('/items/:productId', (c) => cartController.removeFromCart(c))
cartRouter.delete('/clear', (c) => cartController.clearCart(c))

export default cartRouter