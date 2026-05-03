export interface CalculationInput {
  items: {
    priceCents: bigint
    quantity: number
    productId: string
  }[]
  discountCode?: string
  shippingRateId?: string
  taxRateId?: string
}

export interface CalculationResult {
  subtotalCents: bigint
  discountCents: bigint
  shippingCents: bigint
  taxCents: bigint
  totalCents: bigint
}

import { db } from '../db'
import { discounts, shippingRates, taxRates } from '../db/schema'
import { and, eq, lt, gt, isNull } from 'drizzle-orm'

export class CalculationService {
  async calculate(storeId: string, input: CalculationInput): Promise<CalculationResult> {
    const subtotalCents = input.items.reduce(
      (sum, item) => sum + item.priceCents * BigInt(item.quantity),
      0n
    )

    let discountCents = 0n
    if (input.discountCode) {
      const discount = await db.query.discounts.findFirst({
        where: and(
          eq(discounts.storeId, storeId),
          eq(discounts.code, input.discountCode),
          eq(discounts.isActive, true),
          isNull(discounts.deletedAt),
          lt(discounts.startsAt, new Date()),
          // endsAt is null or in future
          sql`(${discounts.endsAt} IS NULL OR ${discounts.endsAt} > NOW())`
        )
      })

      if (discount) {
        if (discount.type === 'PERCENTAGE') {
          discountCents = (subtotalCents * BigInt(Math.floor(Number(discount.value) * 100))) / 10000n
        } else if (discount.type === 'FIXED_AMOUNT') {
          discountCents = discount.valueCents ?? 0n
        }
      }
    }

    let shippingCents = 0n
    if (input.shippingRateId) {
      const rate = await db.query.shippingRates.findFirst({
        where: and(
          eq(shippingRates.storeId, storeId),
          eq(shippingRates.id, input.shippingRateId),
          eq(shippingRates.isActive, true)
        )
      })
      if (rate) shippingCents = rate.priceCents
    }

    let taxCents = 0n
    if (input.taxRateId) {
      const rate = await db.query.taxRates.findFirst({
        where: and(
          eq(taxRates.storeId, storeId),
          eq(taxRates.id, input.taxRateId),
          eq(taxRates.isActive, true)
        )
      })
      if (rate) {
        const taxableAmount = subtotalCents - discountCents
        taxCents = (taxableAmount * BigInt(Math.floor(Number(rate.percentage) * 100))) / 10000n
      }
    }

    const totalCents = subtotalCents - discountCents + shippingCents + taxCents

    return {
      subtotalCents,
      discountCents,
      shippingCents,
      taxCents,
      totalCents,
    }
  }
}

import { sql } from 'drizzle-orm'
export const calculationService = new CalculationService()
