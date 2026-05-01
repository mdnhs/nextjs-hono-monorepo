import { Hono } from 'hono'
import { planController } from '../controllers/plan.controller'
import { authenticate, authorize } from '../middlewares/auth'
import { UserRole } from '@prisma/client'

const planRouter = new Hono()

planRouter.get('/', (c) => planController.getActivePlans(c))
planRouter.get('/all', authenticate, authorize(UserRole.ADMIN), (c) => planController.getAllPlans(c))
planRouter.get('/:id', (c) => planController.getPlanById(c))
planRouter.post('/', authenticate, authorize(UserRole.ADMIN), (c) => planController.createPlan(c))
planRouter.patch('/:id', authenticate, authorize(UserRole.ADMIN), (c) => planController.updatePlan(c))
planRouter.delete('/:id', authenticate, authorize(UserRole.ADMIN), (c) => planController.deletePlan(c))

export default planRouter
