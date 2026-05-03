import { db } from '../db'
import { payments, refunds, orders } from '../db/schema'
import type { PaymentProvider, PaymentStatus } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getProvider } from './payments'

export interface InitiatePaymentInput {
  orderId: string
  provider: PaymentProvider
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
}

export class PaymentService {
  async initiate(input: InitiatePaymentInput) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, input.orderId),
      columns: { id: true, storeId: true, totalCents: true, total: true, currency: true, status: true },
    })
    if (!order) throw new Error('Order not found')
    if (order.status !== 'PENDING') throw new Error('Order not in payable state')

    const amountCents = order.totalCents ?? BigInt(Math.round(Number(order.total) * 100))

    if (input.provider === 'MANUAL') {
      const [created] = await db
        .insert(payments)
        .values({
          orderId: order.id,
          storeId: order.storeId,
          provider: 'MANUAL',
          status: 'PENDING',
          amountCents,
          currency: order.currency,
        })
        .returning()
      return { payment: created }
    }

    const adapter = getProvider(input.provider)
    const intent = await adapter.createIntent({
      orderId: order.id,
      storeId: order.storeId,
      amountCents,
      currency: order.currency,
      customerEmail: input.customerEmail,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    })

    const [created] = await db
      .insert(payments)
      .values({
        orderId: order.id,
        storeId: order.storeId,
        provider: input.provider,
        providerRef: intent.providerRef,
        status: 'PENDING',
        amountCents,
        currency: order.currency,
        providerData: intent.raw as any,
      })
      .returning()

    return {
      payment: created,
      clientSecret: intent.clientSecret,
      redirectUrl: intent.redirectUrl,
    }
  }

  async refund(paymentId: string, amountCents: bigint, reason?: string) {
    const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) })
    if (!payment) throw new Error('Payment not found')
    if (!payment.providerRef && payment.provider !== 'MANUAL') {
      throw new Error('Payment has no provider reference')
    }
    if (amountCents > payment.amountCents) throw new Error('Refund exceeds payment amount')

    let refundRef: string | null = null
    let raw: unknown = null
    if (payment.provider !== 'MANUAL') {
      const adapter = getProvider(payment.provider)
      const result = await adapter.refund({
        providerRef: payment.providerRef!,
        amountCents,
        reason,
      })
      refundRef = result.providerRef
      raw = result.raw
    }

    return db.transaction(async (tx) => {
      const [r] = await tx
        .insert(refunds)
        .values({
          paymentId: payment.id,
          providerRef: refundRef,
          amountCents,
          currency: payment.currency,
          reason,
          providerData: raw as any,
        })
        .returning()

      const newStatus: PaymentStatus =
        amountCents === payment.amountCents ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      await tx.update(payments).set({ status: newStatus }).where(eq(payments.id, payment.id))

      return r
    })
  }

  async handleWebhook(provider: PaymentProvider, rawBody: string, headers: Record<string, string | undefined>) {
    if (provider === 'MANUAL') throw new Error('Manual provider does not support webhooks')
    const adapter = getProvider(provider)
    const event = await adapter.parseWebhook(rawBody, headers)

    if (!event.providerRef || !event.status) return { received: true, applied: false }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.providerRef, event.providerRef),
    })
    if (!payment) return { received: true, applied: false, reason: 'unknown payment' }

    const patch: Record<string, unknown> = { status: event.status, providerData: event.raw }
    const now = new Date()
    if (event.status === 'AUTHORIZED') patch.authorizedAt = now
    if (event.status === 'CAPTURED') patch.capturedAt = now
    if (event.status === 'FAILED') patch.failedAt = now

    await db.update(payments).set(patch as any).where(eq(payments.id, payment.id))

    // Bridge to order state — capture marks order PROCESSING.
    if (event.status === 'CAPTURED') {
      await db.update(orders).set({ status: 'PROCESSING' }).where(eq(orders.id, payment.orderId))
    }

    return { received: true, applied: true, paymentId: payment.id }
  }
}

export const paymentService = new PaymentService()
