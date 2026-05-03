import type { PaymentProviderAdapter } from './provider'
import { stripeAdapter } from './stripe.adapter'
import { sslcommerzAdapter } from './sslcommerz.adapter'
import type { PaymentProvider } from '../../db/schema'

const REGISTRY: Record<PaymentProvider, PaymentProviderAdapter | null> = {
  STRIPE: stripeAdapter,
  SSLCOMMERZ: sslcommerzAdapter,
  // MANUAL = offline / cash-on-delivery; no adapter needed.
  MANUAL: null,
}

export const getProvider = (name: PaymentProvider): PaymentProviderAdapter => {
  const adapter = REGISTRY[name]
  if (!adapter) throw new Error(`Payment provider ${name} not supported for online flows`)
  return adapter
}

export type { PaymentProviderAdapter } from './provider'
export * from './provider'
