import { Hono } from 'hono'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { paymentService } from '../services/payment.service'
import type { PaymentProvider } from '../db/schema'
import { idempotency } from '../middlewares/idempotency'

const router = new Hono()

const initiateSchema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(['STRIPE', 'SSLCOMMERZ', 'MANUAL']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  customerEmail: z.string().email().optional(),
})

router.post('/initiate', idempotency, async (c) => {
  const body = await c.req.json()
  const parsed = initiateSchema.safeParse(body)
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid input', cause: parsed.error.flatten() })

  const result = await paymentService.initiate(parsed.data)
  return c.json({ data: result, error: false, message: 'Payment initiated' })
})

const refundSchema = z.object({
  paymentId: z.string().min(1),
  amountCents: z.union([z.string(), z.number()]),
  reason: z.string().optional(),
})

router.post('/refund', idempotency, async (c) => {
  const body = await c.req.json()
  const parsed = refundSchema.safeParse(body)
  if (!parsed.success) throw new HTTPException(400, { message: 'Invalid input', cause: parsed.error.flatten() })

  const cents = BigInt(parsed.data.amountCents.toString())
  const refund = await paymentService.refund(parsed.data.paymentId, cents, parsed.data.reason)
  return c.json({ data: refund, error: false, message: 'Refund created' })
})

// Webhooks. Routes mounted before auth/tenant middleware in index.ts.
router.post('/webhooks/:provider', async (c) => {
  const provider = c.req.param('provider').toUpperCase() as PaymentProvider
  const rawBody = await c.req.text()
  const headers: Record<string, string | undefined> = {}
  // Pull common signature headers
  for (const h of ['stripe-signature', 'x-ssl-signature']) headers[h] = c.req.header(h)

  try {
    const result = await paymentService.handleWebhook(provider, rawBody, headers)
    return c.json(result)
  } catch (err: any) {
    // Webhook senders interpret 4xx as do-not-retry; use 400 for malformed/invalid sig.
    throw new HTTPException(400, { message: err.message ?? 'webhook error' })
  }
})

export default router
