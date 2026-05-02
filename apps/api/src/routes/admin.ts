import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { adminController } from '../controllers/admin.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS } from '../middlewares/rbac'

const adminRouter = new Hono()

// All admin routes require authentication and ADMIN role
adminRouter.use(authenticate)
adminRouter.use(async (c, next) => {
  const user = c.get('user')
  if (user?.role !== 'ADMIN') {
    throw new HTTPException(403, { message: 'Admin access required' })
  }
  await next()
})

// Dashboard - requires high-level dashboard access
adminRouter.get('/dashboard', requirePermission(PERMISSIONS.PLATFORM_DASHBOARD), (c) => adminController.getDashboard(c))

// Store management
adminRouter.get('/stores', requirePermission(PERMISSIONS.PLATFORM_STORES_READ), (c) => adminController.getAllStores(c))
adminRouter.get('/stores/pending', requirePermission(PERMISSIONS.PLATFORM_STORES_READ), (c) => adminController.getPendingStores(c))
adminRouter.post('/stores/:id/approve', requirePermission(PERMISSIONS.PLATFORM_STORES_MANAGE), (c) => adminController.approveStore(c))
adminRouter.post('/stores/:id/reject', requirePermission(PERMISSIONS.PLATFORM_STORES_MANAGE), (c) => adminController.rejectStore(c))
adminRouter.post('/stores/:id/suspend', requirePermission(PERMISSIONS.PLATFORM_STORES_MANAGE), (c) => adminController.suspendStore(c))

// User management
adminRouter.get('/users', requirePermission(PERMISSIONS.PLATFORM_USERS_READ), (c) => adminController.getAllUsers(c))
adminRouter.get('/users/:id', requirePermission(PERMISSIONS.PLATFORM_USERS_READ), (c) => adminController.getUserDetails(c))

// Subscription management
adminRouter.get('/subscriptions', requirePermission(PERMISSIONS.PLATFORM_SUBSCRIPTIONS_READ), (c) => adminController.getSubscriptions(c))
adminRouter.post('/subscriptions/:id/cancel', requirePermission(PERMISSIONS.PLATFORM_SUBSCRIPTIONS_MANAGE), (c) => adminController.cancelSubscription(c))
adminRouter.patch('/subscriptions/:id', requirePermission(PERMISSIONS.PLATFORM_SUBSCRIPTIONS_MANAGE), (c) => adminController.updateSubscription(c))

// Order management (platform-wide)
adminRouter.get('/orders', requirePermission(PERMISSIONS.PLATFORM_ORDERS_READ), (c) => adminController.getAllOrders(c))

export default adminRouter
