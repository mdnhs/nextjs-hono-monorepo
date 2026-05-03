import { db } from '../db'
import { domainVerifications, stores } from '../db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'
import { resolveTxt } from 'node:dns/promises'
import { invalidateTenantCache } from '../middlewares/tenant'

const VERIFY_RECORD_PREFIX = '_saas-verify'
const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(\.[A-Za-z0-9-]{1,63})+$/

export class DomainService {
  // Strict ASCII hostname validation; reject ports, schemes, paths, IDNs (those would need punycode).
  private assertHostname(hostname: string) {
    const h = hostname.trim().toLowerCase()
    if (!HOSTNAME_RE.test(h)) throw new Error('Invalid hostname')
    return h
  }

  // Step 1: Seller claims a hostname. Reject if any other store already has it.
  async requestVerification(storeId: string, rawHostname: string) {
    const hostname = this.assertHostname(rawHostname)

    const conflictingStore = await db.query.stores.findFirst({
      where: and(eq(stores.customDomain, hostname), ne(stores.id, storeId)),
      columns: { id: true },
    })
    if (conflictingStore) throw new Error('Domain already in use by another store')

    const conflictingVerify = await db.query.domainVerifications.findFirst({
      where: and(eq(domainVerifications.hostname, hostname), ne(domainVerifications.storeId, storeId)),
    })
    if (conflictingVerify && conflictingVerify.status === 'VERIFIED') {
      throw new Error('Domain already verified by another store')
    }

    const existing = await db.query.domainVerifications.findFirst({
      where: and(eq(domainVerifications.storeId, storeId), eq(domainVerifications.hostname, hostname)),
    })

    const txtToken = randomBytes(24).toString('hex')

    if (existing) {
      const [row] = await db
        .update(domainVerifications)
        .set({ txtToken, status: 'PENDING', attempts: 0, failureReason: null, lastCheckedAt: null })
        .where(eq(domainVerifications.id, existing.id))
        .returning()
      return this.buildInstructions(row)
    }

    const [row] = await db
      .insert(domainVerifications)
      .values({ storeId, hostname, txtToken })
      .returning()
    return this.buildInstructions(row)
  }

  // Step 2: Read DNS TXT and compare. On match, flip status + bind to Store.customDomain.
  async checkVerification(verificationId: string) {
    const v = await db.query.domainVerifications.findFirst({
      where: eq(domainVerifications.id, verificationId),
    })
    if (!v) throw new Error('Verification not found')
    if (v.status === 'VERIFIED') return v

    const recordName = `${VERIFY_RECORD_PREFIX}.${v.hostname}`
    let txt: string[][] = []
    try {
      txt = await resolveTxt(recordName)
    } catch (e: any) {
      const reason = e?.code === 'ENODATA' || e?.code === 'ENOTFOUND' ? 'TXT record not found' : `DNS error: ${e?.code ?? 'UNKNOWN'}`
      const [row] = await db
        .update(domainVerifications)
        .set({
          attempts: v.attempts + 1,
          lastCheckedAt: new Date(),
          failureReason: reason,
        })
        .where(eq(domainVerifications.id, v.id))
        .returning()
      return row
    }

    const flat = txt.map((parts) => parts.join(''))
    const match = flat.includes(v.txtToken)

    if (!match) {
      const [row] = await db
        .update(domainVerifications)
        .set({
          attempts: v.attempts + 1,
          lastCheckedAt: new Date(),
          failureReason: 'TXT record found but token did not match',
        })
        .where(eq(domainVerifications.id, v.id))
        .returning()
      return row
    }

    // Match. Bind hostname to the store + invalidate tenant cache so the new domain resolves immediately.
    return db.transaction(async (tx) => {
      const [row] = await tx
        .update(domainVerifications)
        .set({
          status: 'VERIFIED',
          attempts: v.attempts + 1,
          lastCheckedAt: new Date(),
          verifiedAt: new Date(),
          failureReason: null,
        })
        .where(eq(domainVerifications.id, v.id))
        .returning()

      await tx.update(stores).set({ customDomain: v.hostname }).where(eq(stores.id, v.storeId))
      invalidateTenantCache(`host:${v.hostname}`)
      return row
    })
  }

  // Caddy on-demand TLS uses this to decide whether to issue a cert for `hostname`.
  // Returns the verified row (or null) — caller maps to 200/404.
  async listByHostname(hostname: string) {
    const h = hostname.trim().toLowerCase()
    const row = await db.query.domainVerifications.findFirst({
      where: and(eq(domainVerifications.hostname, h), eq(domainVerifications.status, 'VERIFIED')),
    })
    return row ?? null
  }

  async listForStore(storeId: string) {
    return db.query.domainVerifications.findMany({
      where: eq(domainVerifications.storeId, storeId),
      orderBy: (v, { desc }) => [desc(v.createdAt)],
    })
  }

  async remove(verificationId: string) {
    const v = await db.query.domainVerifications.findFirst({
      where: eq(domainVerifications.id, verificationId),
    })
    if (!v) return
    await db.transaction(async (tx) => {
      await tx.delete(domainVerifications).where(eq(domainVerifications.id, v.id))
      // Detach hostname from store if it currently owns it.
      await tx
        .update(stores)
        .set({ customDomain: null })
        .where(and(eq(stores.id, v.storeId), eq(stores.customDomain, v.hostname)))
      invalidateTenantCache(`host:${v.hostname}`)
    })
  }

  private buildInstructions(row: typeof domainVerifications.$inferSelect) {
    return {
      ...row,
      instructions: {
        recordType: 'TXT' as const,
        recordName: `${VERIFY_RECORD_PREFIX}.${row.hostname}`,
        recordValue: row.txtToken,
        // CNAME the apex/host to our edge once verified. Real value depends on infra (Caddy/CF).
        cnameTarget: process.env.CUSTOM_DOMAIN_TARGET ?? 'edge.example.com',
      },
    }
  }
}

export const domainService = new DomainService()
