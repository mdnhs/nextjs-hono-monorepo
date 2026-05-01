import { Decimal } from '@prisma/client/runtime/library'

export const createDecimal = (value: string | number): Decimal => {
  return new Decimal(value)
}

export const mockDecimal = (value: string | number) => {
  const decimal = new Decimal(value)
  return Object.assign(decimal, {
    toJSON: () => value.toString(),
  })
}