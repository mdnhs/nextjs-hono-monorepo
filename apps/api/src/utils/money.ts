// Money helpers. Canonical = integer cents (BigInt). Legacy numeric strings
// are kept in sync until services fully migrate.

export const toCents = (amount: number | string): bigint => {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (!Number.isFinite(n)) throw new Error(`Invalid money amount: ${amount}`)
  return BigInt(Math.round(n * 100))
}

export const fromCents = (cents: bigint | number | null | undefined): number => {
  if (cents == null) return 0
  return Number(cents) / 100
}

// Format for legacy numeric column ("12.34"). Avoids float drift.
export const centsToNumericString = (cents: bigint): string => {
  const sign = cents < 0n ? '-' : ''
  const abs = cents < 0n ? -cents : cents
  const whole = abs / 100n
  const frac = abs % 100n
  return `${sign}${whole}.${frac.toString().padStart(2, '0')}`
}
