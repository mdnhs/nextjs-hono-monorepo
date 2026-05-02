import { vi } from 'vitest'

const makeQueryTable = () => ({
  findFirst: vi.fn(),
  findMany: vi.fn(),
})

export const db = {
  query: {
    users: makeQueryTable(),
    stores: makeQueryTable(),
    products: makeQueryTable(),
    categories: makeQueryTable(),
    reviews: makeQueryTable(),
    reviewHelpfuls: makeQueryTable(),
    carts: makeQueryTable(),
    cartItems: makeQueryTable(),
    orders: makeQueryTable(),
    orderItems: makeQueryTable(),
    plans: makeQueryTable(),
    subscriptions: makeQueryTable(),
    shippingAddresses: makeQueryTable(),
  },
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  select: vi.fn(),
  transaction: vi.fn(),
}

// Helper to chain insert/update/delete fluent API in tests
export function mockInsertReturning(result: any[]) {
  const returning = vi.fn().mockResolvedValue(result)
  const values = vi.fn().mockReturnValue({ returning })
  ;(db.insert as any).mockReturnValue({ values })
  return { values, returning }
}

export function mockUpdateReturning(result: any[]) {
  const returning = vi.fn().mockResolvedValue(result)
  const where = vi.fn().mockReturnValue({ returning })
  const set = vi.fn().mockReturnValue({ where })
  ;(db.update as any).mockReturnValue({ set })
  return { set, where, returning }
}

export function mockSelectFrom(result: any[]) {
  const where = vi.fn().mockResolvedValue(result)
  const from = vi.fn().mockReturnValue({ where })
  ;(db.select as any).mockReturnValue({ from })
  return { from, where }
}
