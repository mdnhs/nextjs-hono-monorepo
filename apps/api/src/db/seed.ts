import 'dotenv/config'
import { db } from './index'
import { categories, plans, users, stores, subscriptions, products } from './schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../utils/auth'

async function upsertCategory(data: { name: string; slug: string; description: string }) {
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, data.slug) })
  if (existing) return existing
  const [row] = await db.insert(categories).values(data).returning()
  return row
}

async function upsertPlan(data: any) {
  const existing = await db.query.plans.findFirst({ where: eq(plans.slug, data.slug) })
  if (existing) return existing
  const [row] = await db.insert(plans).values({
    ...data,
    priceMonthly: String(data.priceMonthly),
    priceYearly: String(data.priceYearly),
  }).returning()
  return row
}

async function upsertUser(data: any) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) })
  if (existing) return existing
  const [row] = await db.insert(users).values(data).returning()
  return row
}

async function main() {
  console.log('🌱 Starting seed...')

  const electronics = await upsertCategory({ name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' })
  const accessories = await upsertCategory({ name: 'Accessories', slug: 'accessories', description: 'Computer and tech accessories' })
  const office = await upsertCategory({ name: 'Office', slug: 'office', description: 'Office supplies and furniture' })

  console.log('✅ Created categories')

  const planDefs = [
    { id: 'plan_starter', name: 'Starter', slug: 'starter', description: 'Perfect for new sellers getting started', priceMonthly: 0, priceYearly: 0, trialDays: 14, maxStores: 1, maxProducts: 50, maxOrders: 100, maxStorageMB: 100, customDomain: false, analytics: false, prioritySupport: false, removeBranding: false, apiAccess: false },
    { id: 'plan_basic', name: 'Basic', slug: 'basic', description: 'For growing businesses', priceMonthly: 9.99, priceYearly: 99.99, trialDays: 0, maxStores: 1, maxProducts: 200, maxOrders: 500, maxStorageMB: 500, customDomain: false, analytics: true, prioritySupport: false, removeBranding: false, apiAccess: false },
    { id: 'plan_pro', name: 'Pro', slug: 'pro', description: 'For established sellers', priceMonthly: 29.99, priceYearly: 299.99, trialDays: 0, maxStores: 3, maxProducts: 1000, maxOrders: null, maxStorageMB: 2000, customDomain: true, analytics: true, prioritySupport: false, removeBranding: true, apiAccess: true },
    { id: 'plan_enterprise', name: 'Enterprise', slug: 'enterprise', description: 'Unlimited scale for large businesses', priceMonthly: 99.99, priceYearly: 999.99, trialDays: 0, maxStores: null, maxProducts: null, maxOrders: null, maxStorageMB: 10000, customDomain: true, analytics: true, prioritySupport: true, removeBranding: true, apiAccess: true },
  ]

  const insertedPlans: Record<string, any> = {}
  for (const plan of planDefs) {
    insertedPlans[plan.slug] = await upsertPlan(plan)
  }

  console.log('✅ Created plans')

  await upsertUser({
    email: 'admin@example.com',
    password: await hashPassword('admin123'),
    name: 'Platform Admin',
    role: 'ADMIN' as const,
  })

  const seller = await upsertUser({
    email: 'seller@example.com',
    password: await hashPassword('seller123'),
    name: 'Test Seller',
    role: 'SELLER' as const,
  })

  console.log('✅ Created users')

  let store = await db.query.stores.findFirst({ where: eq(stores.slug, 'tech-gadgets-store') })
  if (!store) {
    const [s] = await db.insert(stores).values({
      name: 'Tech Gadgets Store',
      description: 'Your one-stop shop for the latest tech gadgets',
      slug: 'tech-gadgets-store',
      ownerId: seller.id,
      status: 'APPROVED',
    }).returning()
    store = s
  }

  console.log('✅ Created store:', store.name)

  const starterPlan = insertedPlans['starter']
  const existingSub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.storeId, store.id) })
  if (!existingSub) {
    await db.insert(subscriptions).values({
      storeId: store.id,
      planId: starterPlan.id,
      billingCycle: 'MONTHLY',
      status: 'TRIAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    })
  }

  console.log('✅ Created subscription')

  const productDefs = [
    { name: 'Wireless Bluetooth Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 89.99, sku: 'WBH-001', quantity: 50, images: [] as string[], categoryId: electronics.id },
    { name: 'Smart Watch Pro', description: 'Advanced fitness tracking and smartphone integration', price: 299.99, sku: 'SWP-002', quantity: 30, images: [] as string[], categoryId: electronics.id },
    { name: 'Portable Power Bank', description: '20000mAh fast charging power bank with USB-C', price: 49.99, sku: 'PPB-003', quantity: 100, images: [] as string[], categoryId: accessories.id },
    { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical gaming keyboard', price: 129.99, sku: 'MKB-004', quantity: 25, images: [] as string[], categoryId: accessories.id },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with precision tracking', price: 39.99, sku: 'WMS-005', quantity: 75, images: [] as string[], categoryId: accessories.id },
    { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', price: 59.99, sku: 'UCH-006', quantity: 40, images: [] as string[], categoryId: accessories.id },
    { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand for better ergonomics', price: 34.99, sku: 'LPS-007', quantity: 60, images: [] as string[], categoryId: office.id },
    { name: 'Desk Organizer', description: 'Bamboo desk organizer with multiple compartments', price: 24.99, sku: 'DSO-008', quantity: 80, images: [] as string[], categoryId: office.id },
  ]

  for (const p of productDefs) {
    const existing = await db.query.products.findFirst({ where: eq(products.sku, p.sku) })
    if (!existing) {
      await db.insert(products).values({ ...p, price: String(p.price), storeId: store.id })
    }
  }

  console.log(`✅ Created ${productDefs.length} products`)

  await upsertUser({
    email: 'buyer@example.com',
    password: await hashPassword('buyer123'),
    name: 'Test Buyer',
    role: 'BUYER' as const,
  })

  console.log('🎉 Seed completed!')
  console.log('\n📝 Test accounts:')
  console.log('  Admin:  admin@example.com / admin123')
  console.log('  Seller: seller@example.com / seller123')
  console.log('  Buyer:  buyer@example.com / buyer123')
}

main().catch((e) => {
  console.error('❌ Seed failed:', e)
  process.exit(1)
})
