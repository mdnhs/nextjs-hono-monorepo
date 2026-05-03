// PaymentProvider — abstract over Stripe, SSLCommerz, etc.
// All amounts in integer cents. Currency = ISO 4217.

export interface CreateIntentInput {
  orderId: string
  storeId: string
  amountCents: bigint
  currency: string
  customerEmail?: string
  // Where to redirect after hosted payment (SSLCommerz). Stripe ignores when using PaymentIntent only.
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}

export interface CreateIntentResult {
  // Provider-side id (pi_xxx, tran_id, etc).
  providerRef: string
  // Token for client SDK to confirm payment (Stripe client_secret).
  clientSecret?: string
  // Hosted page URL (SSLCommerz / Stripe Checkout).
  redirectUrl?: string
  // Raw payload to persist on Payment.providerData.
  raw: unknown
}

export interface CaptureInput {
  providerRef: string
  amountCents?: bigint
}

export interface RefundInput {
  providerRef: string
  amountCents: bigint
  reason?: string
}

export interface RefundResult {
  providerRef: string
  raw: unknown
}

export interface WebhookEvent {
  // Provider-defined event type (e.g. 'payment_intent.succeeded').
  type: string
  // Provider object id (pi_xxx).
  providerRef?: string
  // Map provider status → our PaymentStatus to apply.
  status?: 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  amountCents?: bigint
  currency?: string
  raw: unknown
}

export interface PaymentProviderAdapter {
  readonly name: 'STRIPE' | 'SSLCOMMERZ' | 'MANUAL'
  createIntent(input: CreateIntentInput): Promise<CreateIntentResult>
  capture(input: CaptureInput): Promise<{ raw: unknown }>
  refund(input: RefundInput): Promise<RefundResult>
  // Verify webhook signature; throw if invalid. Return parsed event.
  parseWebhook(rawBody: string, headers: Record<string, string | undefined>): Promise<WebhookEvent>
}
