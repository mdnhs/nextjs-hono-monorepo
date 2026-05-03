import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const adjustInventorySchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  delta: z.number().int({ message: 'Delta must be an integer' }),
  reason: z.string().min(1, 'Reason is required'),
});
