import { db } from '../db'
import { inventoryLevels, inventoryTransactions } from '../db/schema'
import { and, eq, sql } from 'drizzle-orm'

export interface AdjustInventoryInput {
  variantId: string
  locationId: string
  delta: number // positive for addition, negative for deduction
  reason: string
  referenceId?: string
  referenceType?: string
}

export class InventoryService {
  /**
   * Adjust inventory levels and record transaction.
   * Atomic operation using DB transaction.
   */
  async adjust(input: AdjustInventoryInput) {
    return await db.transaction(async (tx) => {
      // 1. Get or create inventory level
      let level = await tx.query.inventoryLevels.findFirst({
        where: and(
          eq(inventoryLevels.variantId, input.variantId),
          eq(inventoryLevels.locationId, input.locationId)
        )
      })

      if (!level) {
        const [newLevel] = await tx.insert(inventoryLevels).values({
          variantId: input.variantId,
          locationId: input.locationId,
          available: 0,
          reserved: 0,
          onHand: 0,
        }).returning()
        level = newLevel
      }

      // 2. Update levels
      // For a simple adjustment, we affect 'available' and 'onHand'.
      const [updated] = await tx.update(inventoryLevels)
        .set({
          available: sql`${inventoryLevels.available} + ${input.delta}`,
          onHand: sql`${inventoryLevels.onHand} + ${input.delta}`,
        })
        .where(eq(inventoryLevels.id, level.id))
        .returning()

      // 3. Record transaction
      await tx.insert(inventoryTransactions).values({
        inventoryLevelId: level.id,
        type: 'ADJUSTMENT',
        quantity: input.delta,
        reason: input.reason,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
      })

      return updated
    })
  }

  /**
   * Reserve inventory for an order.
   * Moves quantity from 'available' to 'reserved'. 'onHand' stays same.
   */
  async reserve(input: Omit<AdjustInventoryInput, 'delta'> & { quantity: number }) {
    return await db.transaction(async (tx) => {
      const level = await tx.query.inventoryLevels.findFirst({
        where: and(
          eq(inventoryLevels.variantId, input.variantId),
          eq(inventoryLevels.locationId, input.locationId)
        )
      })

      if (!level || level.available < input.quantity) {
        throw new Error('Insufficient inventory available')
      }

      const [updated] = await tx.update(inventoryLevels)
        .set({
          available: sql`${inventoryLevels.available} - ${input.quantity}`,
          reserved: sql`${inventoryLevels.reserved} + ${input.quantity}`,
        })
        .where(eq(inventoryLevels.id, level.id))
        .returning()

      await tx.insert(inventoryTransactions).values({
        inventoryLevelId: level.id,
        type: 'RESERVATION',
        quantity: -input.quantity,
        reason: input.reason,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
      })

      return updated
    })
  }

  async getStock(variantId: string) {
    const levels = await db.query.inventoryLevels.findMany({
      where: eq(inventoryLevels.variantId, variantId),
    })

    return {
      totalAvailable: levels.reduce((sum, l) => sum + l.available, 0),
      totalReserved: levels.reduce((sum, l) => sum + l.reserved, 0),
      totalOnHand: levels.reduce((sum, l) => sum + l.onHand, 0),
      levels,
    }
  }
}

export const inventoryService = new InventoryService()
