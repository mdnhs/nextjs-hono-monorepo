import { Redis, type RedisOptions } from 'ioredis'

// Single shared Redis connection for all queues + workers in this process.
// BullMQ requires `maxRetriesPerRequest: null` for blocking commands on workers.

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
}

let connection: Redis | null = null

export const getRedis = (): Redis => {
  if (!connection) connection = new Redis(redisUrl, baseOptions)
  return connection
}

export const closeRedis = async (): Promise<void> => {
  if (connection) {
    await connection.quit()
    connection = null
  }
}
