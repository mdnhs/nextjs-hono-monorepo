// Worker process entry. Run via `tsx --env-file=.env src/queue/worker.ts`.
// Keep this separate from API server; deploy as its own container/process.

import dotenv from 'dotenv'
dotenv.config()

import { Worker, type Job } from 'bullmq'
import { getRedis } from './connection'
import { QUEUE_NAMES, type EmailJob, type WebhookJob, type SearchIndexJob } from './queues'
import { deliverWebhook } from '../services/webhook.service'
import { purgeExpiredIdempotencyKeys } from '../middlewares/idempotency'

const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '10', 10)

// Email worker — currently logs only. Wire SES/SendGrid here.
const emailWorker = new Worker<EmailJob>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJob>) => {
    console.log('[email]', job.data.to, job.data.subject)
    // TODO: integrate provider (SES, SendGrid, Postmark)
  },
  { connection: getRedis(), concurrency },
)

const webhookWorker = new Worker<WebhookJob>(
  QUEUE_NAMES.WEBHOOK,
  async (job: Job<WebhookJob>) => deliverWebhook(job.data),
  { connection: getRedis(), concurrency },
)

import { searchService } from '../services/search.service'
import { db } from '../db'
import { products, categories } from '../db/schema'
import { eq } from 'drizzle-orm'

const searchWorker = new Worker<SearchIndexJob>(
  QUEUE_NAMES.SEARCH_INDEX,
  async (job: Job<SearchIndexJob>) => {
    const { op, productId } = job.data
    console.log('[search-index]', op, productId)

    if (op === 'DELETE') {
      await searchService.deleteProduct(productId)
      return
    }

    const p = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { category: { columns: { name: true } } },
    })

    if (!p) return

    await searchService.indexProduct({
      id: p.id,
      storeId: p.storeId,
      name: p.name,
      description: p.description,
      priceCents: Number(p.priceCents ?? 0),
      currency: p.currency,
      images: p.images,
      sku: p.sku,
      categoryName: p.category?.name ?? null,
      isActive: p.isActive,
    })
  },
  { connection: getRedis(), concurrency },
)

// Cleanup worker — runs periodic maintenance. Schedule via repeatable jobs.
const cleanupWorker = new Worker(
  QUEUE_NAMES.CLEANUP,
  async (job: Job) => {
    if (job.name === 'purge-idempotency') {
      const removed = await purgeExpiredIdempotencyKeys()
      return { removed }
    }
    throw new Error(`Unknown cleanup job: ${job.name}`)
  },
  { connection: getRedis(), concurrency: 1 },
)

for (const w of [emailWorker, webhookWorker, searchWorker, cleanupWorker]) {
  w.on('failed', (job, err) => {
    console.error(`[worker:${w.name}] job ${job?.id} failed:`, err.message)
  })
  w.on('error', (err) => {
    console.error(`[worker:${w.name}] error:`, err)
  })
}

const shutdown = async (signal: string) => {
  console.log(`[worker] ${signal} received, shutting down`)
  await Promise.all([emailWorker.close(), webhookWorker.close(), searchWorker.close(), cleanupWorker.close()])
  process.exit(0)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

console.log('[worker] started')
