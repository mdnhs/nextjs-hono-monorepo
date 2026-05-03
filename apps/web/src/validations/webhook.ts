import { z } from 'zod';

export const createWebhookSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  url: z.string().url('Invalid URL'),
});
