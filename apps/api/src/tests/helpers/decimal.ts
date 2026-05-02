export const createDecimal = (value: string | number) => {
  return { toString: () => String(value), toNumber: () => Number(value), value: String(value) }
}

export const mockDecimal = (value: string | number) => {
  return { toString: () => String(value), toJSON: () => String(value), toNumber: () => Number(value) }
}
