// Cron registration. Run from the worker process at boot — repeatable jobs get added/upserted
// idempotently in BullMQ, so re-running is safe. Each job dispatches into the CLEANUP queue,
// where the worker dispatches by `job.name`.

import { getQueue, QUEUE_NAMES } from './queues'

export interface CronSpec {
  name: string
  pattern: string // node-cron expression: 'm h dom mon dow'
  // Concurrency note: BullMQ ensures only one instance per (name, pattern) tuple in the cluster.
}

// Edit this list to add new cron entries. Worker handles them by `job.name`.
export const CRON_JOBS: CronSpec[] = [
  // Hourly: prune expired idempotency keys.
  { name: 'purge-idempotency', pattern: '0 * * * *' },
  // Daily 03:10 UTC: flip overdue subscriptions to EXPIRED.
  { name: 'expire-subscriptions', pattern: '10 3 * * *' },
  // Hourly: detect abandoned carts and emit cart.abandoned webhook.
  { name: 'abandoned-carts', pattern: '20 * * * *' },
]

export const registerCronJobs = async (): Promise<void> => {
  const queue = getQueue(QUEUE_NAMES.CLEANUP)

  for (const spec of CRON_JOBS) {
    await queue.add(
      spec.name,
      {},
      {
        repeat: { pattern: spec.pattern },
        // Stable jobId keeps the schedule a single entry rather than spawning duplicates per worker boot.
        jobId: `cron:${spec.name}`,
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 200 },
      },
    )
    console.log(`[cron] scheduled ${spec.name} @ ${spec.pattern}`)
  }
}
