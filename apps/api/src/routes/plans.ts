import { Hono } from 'hono'
import { planController } from '../controllers/plan.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS } from '../middlewares/rbac'

const planRouter = new Hono()

planRouter.get('/', (c) => planController.getActivePlans(c))
planRouter.get('/all', authenticate, requirePermission(PERMISSIONS.PLATFORM_PLANS_MANAGE), (c) => planController.getAllPlans(c))
planRouter.get('/:id', (c) => planController.getPlanById(c))
planRouter.post('/', authenticate, requirePermission(PERMISSIONS.PLATFORM_PLANS_MANAGE), (c) => planController.createPlan(c))
planRouter.patch('/:id', authenticate, requirePermission(PERMISSIONS.PLATFORM_PLANS_MANAGE), (c) => planController.updatePlan(c))
planRouter.delete('/:id', authenticate, requirePermission(PERMISSIONS.PLATFORM_PLANS_MANAGE), (c) => planController.deletePlan(c))

export default planRouter
