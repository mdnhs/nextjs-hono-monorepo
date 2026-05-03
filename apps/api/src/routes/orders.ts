import { Hono } from 'hono'
import { orderController } from '../controllers/order.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireOrderOwnership } from '../middlewares/rbac'

const ordersRouter = new Hono()

ordersRouter.use(authenticate)

// Checkout moved to /api/storefront/checkout — see storefront-checkout router.
ordersRouter.get('/', requirePermission(PERMISSIONS.BUYER_ORDERS), (c) => orderController.getOrders(c))
ordersRouter.get('/my', requirePermission(PERMISSIONS.SELLER_ORDERS_MANAGE), (c) => orderController.getSellerOrders(c))
ordersRouter.get('/all', requirePermission(PERMISSIONS.PLATFORM_ORDERS_READ), (c) => orderController.getAllOrders(c))
ordersRouter.get('/:id', requireOrderOwnership, (c) => orderController.getOrderById(c))
ordersRouter.patch('/:id/status', requirePermission(PERMISSIONS.SELLER_ORDERS_MANAGE), requireOrderOwnership, (c) => orderController.updateOrderStatus(c))

export default ordersRouter