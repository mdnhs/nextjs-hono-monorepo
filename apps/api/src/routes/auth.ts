import { Hono } from 'hono'
import { authController } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth'

const authRouter = new Hono()

authRouter.post('/register', (c) => authController.register(c))
authRouter.post('/login', (c) => authController.login(c))
authRouter.post('/logout', authenticate, (c) => authController.logout(c))
authRouter.get('/profile', authenticate, (c) => authController.getProfile(c))

export default authRouter