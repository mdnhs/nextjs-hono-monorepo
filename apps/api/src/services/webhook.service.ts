import { db } from '../db'
import { webhooks, webhookDeliveries } from '../db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { enqueueWebhook, type WebhookJob } from '../queue/queues'

// Topics emitted by the platform. Add new ones here as features ship.
export const WEBHOOK_TOPICS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_PAID: 'order.paid',
  ORDER_REFUNDED: 'order.refunded',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  CUSTOMER_CREATED: 'customer.created',
} as const

export type WebhookTopic = (typeof WEBHOOK_TOPICS)[keyof typeof WEBHOOK_TOPICS]

const sign = async (secret: string, body: string): Promise<string> => {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Public API: invoked from services after state change. Fans out to BullMQ jobs per subscription.
export const emitWebhook = async (
  storeId: string,
  topic: WebhookTopic,
  payload: unknown,
): Promise<void> => {
  const subs = await db.query.webhooks.findMany({
    where: and(
      eq(webhooks.storeId, storeId),
      eq(webhooks.topic, topic),
      eq(webhooks.isActive, true),
      isNull(webhooks.deletedAt),
    ),
    columns: { id: true },
  })

  await Promise.all(
    subs.map((s) => enqueueWebhook({ webhookId: s.id, topic, payload })),
  )
}

// Worker handler. Called from `queue/worker.ts`.
export const deliverWebhook = async (job: WebhookJob): Promise<void> => {
  const sub = await db.query.webhooks.findFirst({ where: eq(webhooks.id, job.webhookId) })
  if (!sub || !sub.isActive || sub.deletedAt) return

  const body = JSON.stringify({ topic: job.topic, payload: job.payload, deliveredAt: new Date().toISOString() })
  const signature = await sign(sub.secret, body)

  let responseStatus: number | null = null
  let responseBody: string | null = null
  let errorMessage: string | null = null
  let succeeded = false

  try {
    const res = await fetch(sub.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Topic': job.topic,
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': sub.id,
      },
      body,
      // Generous timeout — provider must respond < 30s.
      signal: AbortSignal.timeout(30_000),
    })
    responseStatus = res.status
    responseBody = (await res.text()).slice(0, 4096)
    succeeded = res.ok
    if (!succeeded) errorMessage = `HTTP ${res.status}`
  } catch (err: any) {
    errorMessage = err?.message ?? String(err)
  }

  await db.insert(webhookDeliveries).values({
    webhookId: sub.id,
    topic: job.topic,
    payload: job.payload as any,
    responseStatus,
    responseBody,
    errorMessage,
    succeeded,
    deliveredAt: new Date(),
  })

  // Throw to let BullMQ retry (exponential backoff via defaultJobOptions).
  if (!succeeded) throw new Error(errorMessage ?? 'webhook delivery failed')
}
