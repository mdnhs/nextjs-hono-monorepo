import type {
  PaymentProviderAdapter,
  CreateIntentInput,
  CreateIntentResult,
  CaptureInput,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from './provider'

// Stripe adapter — uses REST API directly via fetch to avoid bundling stripe-node.
// Replace with `stripe` SDK if richer typings desired. Keeps cold-start small for serverless.

const STRIPE_API = 'https://api.stripe.com/v1'

const requireKey = (): string => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not set')
  return key
}

const requireWebhookSecret = (): string => {
  const sec = process.env.STRIPE_WEBHOOK_SECRET
  if (!sec) throw new Error('STRIPE_WEBHOOK_SECRET not set')
  return sec
}

const stripeFetch = async (path: string, body: Record<string, string>): Promise<any> => {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  const json: any = await res.json()
  if (!res.ok) {
    throw new Error(`Stripe ${path} failed: ${json?.error?.message ?? res.statusText}`)
  }
  return json
}

// HMAC-SHA256 webhook signature verification (Stripe scheme: t=...,v1=...)
const verifyStripeSignature = async (
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
): Promise<void> => {
  if (!signatureHeader) throw new Error('Missing Stripe signature header')
  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split('=')
    if (k && v) acc[k] = v
    return acc
  }, {})
  const t = parts['t']
  const v1 = parts['v1']
  if (!t || !v1) throw new Error('Malformed Stripe signature')

  const payload = `${t}.${rawBody}`
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  if (hex !== v1) throw new Error('Stripe signature mismatch')

  // Replay guard: 5-minute tolerance
  const ts = parseInt(t, 10) * 1000
  if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    throw new Error('Stripe webhook timestamp outside tolerance')
  }
}

export const stripeAdapter: PaymentProviderAdapter = {
  name: 'STRIPE',

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const body: Record<string, string> = {
      amount: input.amountCents.toString(),
      currency: input.currency.toLowerCase(),
      'automatic_payment_methods[enabled]': 'true',
      'metadata[orderId]': input.orderId,
      'metadata[storeId]': input.storeId,
    }
    if (input.customerEmail) body['receipt_email'] = input.customerEmail
    if (input.metadata) {
      for (const [k, v] of Object.entries(input.metadata)) body[`metadata[${k}]`] = v
    }
    const intent = await stripeFetch('/payment_intents', body)
    return {
      providerRef: intent.id,
      clientSecret: intent.client_secret,
      raw: intent,
    }
  },

  async capture(input: CaptureInput): Promise<{ raw: unknown }> {
    const body: Record<string, string> = {}
    if (input.amountCents !== undefined) body['amount_to_capture'] = input.amountCents.toString()
    const captured = await stripeFetch(`/payment_intents/${input.providerRef}/capture`, body)
    return { raw: captured }
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    const body: Record<string, string> = {
      payment_intent: input.providerRef,
      amount: input.amountCents.toString(),
    }
    if (input.reason) body['reason'] = input.reason
    const refund = await stripeFetch('/refunds', body)
    return { providerRef: refund.id, raw: refund }
  },

  async parseWebhook(rawBody, headers): Promise<WebhookEvent> {
    await verifyStripeSignature(rawBody, headers['stripe-signature'], requireWebhookSecret())
    const event = JSON.parse(rawBody)
    const obj = event?.data?.object
    const statusMap: Record<string, WebhookEvent['status']> = {
      'payment_intent.succeeded': 'CAPTURED',
      'payment_intent.payment_failed': 'FAILED',
      'payment_intent.canceled': 'CANCELLED',
      'payment_intent.requires_action': 'AUTHORIZED',
      'charge.refunded': 'REFUNDED',
    }
    return {
      type: event.type,
      providerRef: obj?.id,
      status: statusMap[event.type],
      amountCents: obj?.amount != null ? BigInt(obj.amount) : undefined,
      currency: obj?.currency,
      raw: event,
    }
  },
}
