import { Hono } from 'hono'
import { storefrontAuthController } from '../controllers/storefront-auth.controller'
import { authenticateCustomer } from '../middlewares/auth'

const storefrontAuthRouter = new Hono()

storefrontAuthRouter.post('/register', (c) => storefrontAuthController.register(c))
storefrontAuthRouter.post('/login', (c) => storefrontAuthController.login(c))
storefrontAuthRouter.post('/logout', (c) => storefrontAuthController.logout(c))
storefrontAuthRouter.get('/profile', authenticateCustomer, (c) => storefrontAuthController.getProfile(c))

export default storefrontAuthRouter
