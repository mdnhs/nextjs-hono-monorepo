import { Hono } from 'hono'
import { resolveTenant } from '../middlewares/tenant'
import { resolveCartIdentity } from '../middlewares/storefront'
import { storefrontCartController } from '../controllers/storefront-cart.controller'

const router = new Hono()

router.use(resolveTenant)
router.use(resolveCartIdentity)

router.get('/', (c) => storefrontCartController.getCart(c))
router.post('/items', (c) => storefrontCartController.addToCart(c))
router.patch('/items/:itemId', (c) => storefrontCartController.updateItem(c))
router.delete('/items/:itemId', (c) => storefrontCartController.removeItem(c))
router.delete('/', (c) => storefrontCartController.clear(c))

export default router
