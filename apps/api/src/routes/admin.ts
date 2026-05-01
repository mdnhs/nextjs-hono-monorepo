import { Hono } from 'hono'
import { adminController } from '../controllers/admin.controller'
import { authenticate, authorize } from '../middlewares/auth'
import { UserRole } from '@prisma/client'

const adminRouter = new Hono()

// All admin routes require admin role
adminRouter.use('*', authenticate, authorize(UserRole.ADMIN))

// Dashboard
adminRouter.get('/dashboard', (c) => adminController.getDashboard(c))

// Store management
adminRouter.get('/stores', (c) => adminController.getAllStores(c))
adminRouter.get('/stores/pending', (c) => adminController.getPendingStores(c))
adminRouter.post('/stores/:id/approve', (c) => adminController.approveStore(c))
adminRouter.post('/stores/:id/reject', (c) => adminController.rejectStore(c))
adminRouter.post('/stores/:id/suspend', (c) => adminController.suspendStore(c))

// User management
adminRouter.get('/users', (c) => adminController.getAllUsers(c))
adminRouter.get('/users/:id', (c) => adminController.getUserDetails(c))

// Subscription management
adminRouter.get('/subscriptions', (c) => adminController.getSubscriptions(c))

export default adminRouter
