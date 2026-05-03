import { Hono } from 'hono'
import { resolveTenant } from '../middlewares/tenant'
import { resolveCartIdentity } from '../middlewares/storefront'
import { idempotency } from '../middlewares/idempotency'
import { enforceOrderLimit } from '../middlewares/limits'
import { storefrontCheckoutController } from '../controllers/storefront-checkout.controller'

const router = new Hono()

router.use(resolveTenant)
router.use(resolveCartIdentity)

router.post('/', enforceOrderLimit, idempotency, (c) => storefrontCheckoutController.checkout(c))

export default router
