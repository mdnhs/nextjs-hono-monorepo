import { Queue, type JobsOptions } from 'bullmq'
import { getRedis } from './connection'

// Queue registry. Add new queues here. Workers in `worker.ts` consume them.

export const QUEUE_NAMES = {
  EMAIL: 'email',
  WEBHOOK: 'webhook',
  SEARCH_INDEX: 'search-index',
  CLEANUP: 'cleanup',
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: { count: 1000, age: 24 * 3600 },
  removeOnFail: { count: 5000, age: 7 * 24 * 3600 },
}

const queues = new Map<QueueName, Queue>()

export const getQueue = (name: QueueName): Queue => {
  let q = queues.get(name)
  if (!q) {
    q = new Queue(name, {
      connection: getRedis(),
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    })
    queues.set(name, q)
  }
  return q
}

// Typed enqueue helpers — gives compile-time safety on payload shapes.

export interface EmailJob {
  to: string
  subject: string
  template: string
  data?: Record<string, unknown>
}

export interface WebhookJob {
  webhookId: string
  topic: string
  payload: unknown
  // Attempt-internal: not for callers. BullMQ retry logic handles retries automatically.
}

export interface SearchIndexJob {
  storeId: string
  productId: string
  op: 'upsert' | 'delete'
}

export const enqueueEmail = (job: EmailJob, opts?: JobsOptions) =>
  getQueue(QUEUE_NAMES.EMAIL).add('send', job, opts)

export const enqueueWebhook = (job: WebhookJob, opts?: JobsOptions) =>
  getQueue(QUEUE_NAMES.WEBHOOK).add('deliver', job, opts)

export const enqueueSearchIndex = (job: SearchIndexJob, opts?: JobsOptions) =>
  getQueue(QUEUE_NAMES.SEARCH_INDEX).add('sync', job, opts)
