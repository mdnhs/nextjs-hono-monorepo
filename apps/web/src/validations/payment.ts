import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  provider: z.enum(['STRIPE', 'SSLCOMMERZ', 'MANUAL'], {
    errorMap: () => ({ message: 'Invalid payment provider' }),
  }),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
  customerEmail: z.string().email('Invalid customer email'),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amountCents: z.number().int().positive('Amount must be a positive integer'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});
