import 'dotenv/config'
import { db } from './index'
import { users, stores, storeStaffs, plans, subscriptions } from './schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../utils/auth'

async function setupTestStore() {
  console.log('🧪 Setting up test-store...')

  // Get or create seller
  let seller = await db.query.users.findFirst({ where: eq(users.email, 'seller@example.com') })
  if (!seller) {
    const [u] = await db.insert(users).values({
      email: 'seller@example.com',
      password: await hashPassword('seller123'),
      name: 'Test Seller',
      role: 'SELLER',
    }).returning()
    seller = u
  }

  // Get plan
  const plan = await db.query.plans.findFirst({ where: eq(plans.slug, 'starter') })
  if (!plan) {
    console.error('Starter plan not found. Please run seed first.')
    return
  }

  // Create test-store
  let store = await db.query.stores.findFirst({ where: eq(stores.slug, 'test-store') })
  if (!store) {
    const [s] = await db.insert(stores).values({
      name: 'Test Store',
      description: 'A store for testing purposes',
      slug: 'test-store',
      ownerId: seller.id,
      status: 'APPROVED',
    }).returning()
    store = s
    console.log('✅ Created test-store')
  } else {
    // Ensure it is APPROVED
    await db.update(stores).set({ status: 'APPROVED' }).where(eq(stores.id, store.id))
    console.log('✅ Updated test-store status to APPROVED')
  }

  // Ensure subscription
  const existingSub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.storeId, store.id) })
  if (!existingSub) {
    await db.insert(subscriptions).values({
      storeId: store.id,
      planId: plan.id,
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    console.log('✅ Created subscription for test-store')
  }

  console.log('🎉 test-store is ready!')
}

setupTestStore().catch(console.error)
