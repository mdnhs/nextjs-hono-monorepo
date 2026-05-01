import { Hono } from 'hono'
import { orderController } from '../controllers/order.controller'
import { authenticate, authorize } from '../middlewares/auth'
import { UserRole } from '@prisma/client'

const ordersRouter = new Hono()

ordersRouter.use('*', authenticate)

ordersRouter.post('/checkout', (c) => orderController.createOrder(c))
ordersRouter.get('/', (c) => orderController.getOrders(c))
ordersRouter.get('/my', authorize(UserRole.SELLER, UserRole.ADMIN), (c) => orderController.getSellerOrders(c))
ordersRouter.get('/all', authorize(UserRole.ADMIN), (c) => orderController.getAllOrders(c))
ordersRouter.get('/:id', (c) => orderController.getOrderById(c))
ordersRouter.patch('/:id/status', authorize(UserRole.SELLER, UserRole.ADMIN), (c) => orderController.updateOrderStatus(c))

export default ordersRouter