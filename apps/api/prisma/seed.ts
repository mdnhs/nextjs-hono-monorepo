import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
    },
  })

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Computer and tech accessories',
    },
  })

  const office = await prisma.category.upsert({
    where: { slug: 'office' },
    update: {},
    create: {
      name: 'Office',
      slug: 'office',
      description: 'Office supplies and furniture',
    },
  })

  console.log('✅ Created categories')

  // Create default plans
  const plans = [
    {
      id: 'plan_starter',
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for new sellers getting started',
      priceMonthly: 0,
      priceYearly: 0,
      trialDays: 14,
      maxStores: 1,
      maxProducts: 50,
      maxOrders: 100,
      maxStorageMB: 100,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
      removeBranding: false,
      apiAccess: false,
    },
    {
      id: 'plan_basic',
      name: 'Basic',
      slug: 'basic',
      description: 'For growing businesses',
      priceMonthly: 9.99,
      priceYearly: 99.99,
      trialDays: 0,
      maxStores: 1,
      maxProducts: 200,
      maxOrders: 500,
      maxStorageMB: 500,
      customDomain: false,
      analytics: true,
      prioritySupport: false,
      removeBranding: false,
      apiAccess: false,
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      slug: 'pro',
      description: 'For established sellers',
      priceMonthly: 29.99,
      priceYearly: 299.99,
      trialDays: 0,
      maxStores: 3,
      maxProducts: 1000,
      maxOrders: null,
      maxStorageMB: 2000,
      customDomain: true,
      analytics: true,
      prioritySupport: false,
      removeBranding: true,
      apiAccess: true,
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Unlimited scale for large businesses',
      priceMonthly: 99.99,
      priceYearly: 999.99,
      trialDays: 0,
      maxStores: null,
      maxProducts: null,
      maxOrders: null,
      maxStorageMB: 10000,
      customDomain: true,
      analytics: true,
      prioritySupport: true,
      removeBranding: true,
      apiAccess: true,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    })
  }

  console.log('✅ Created plans')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Created admin:', admin.email)

  // Create a test seller user
  const sellerPassword = await hashPassword('seller123')
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      password: sellerPassword,
      name: 'Test Seller',
      role: 'SELLER',
    },
  })

  console.log('✅ Created seller:', seller.email)

  // Create a test store (APPROVED so it's live)
  const starterPlan = await prisma.plan.findUniqueOrThrow({
    where: { slug: 'starter' },
  })

  const store = await prisma.store.upsert({
    where: { slug: 'tech-gadgets-store' },
    update: {},
    create: {
      name: 'Tech Gadgets Store',
      description: 'Your one-stop shop for the latest tech gadgets',
      slug: 'tech-gadgets-store',
      ownerId: seller.id,
      status: 'APPROVED',
    },
  })

  console.log('✅ Created store:', store.name)

  // Create subscription for the store
  await prisma.subscription.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      planId: starterPlan.id,
      billingCycle: 'MONTHLY',
      status: 'TRIAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
    },
  })

  console.log('✅ Created subscription for store')

  // Create sample products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 89.99,
      sku: 'WBH-001',
      quantity: 50,
      images: [],
      categoryId: electronics.id,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Advanced fitness tracking and smartphone integration',
      price: 299.99,
      sku: 'SWP-002',
      quantity: 30,
      images: [],
      categoryId: electronics.id,
    },
    {
      name: 'Portable Power Bank',
      description: '20000mAh fast charging power bank with USB-C',
      price: 49.99,
      sku: 'PPB-003',
      quantity: 100,
      images: [],
      categoryId: accessories.id,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical gaming keyboard',
      price: 129.99,
      sku: 'MKB-004',
      quantity: 25,
      images: [],
      categoryId: accessories.id,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 39.99,
      sku: 'WMS-005',
      quantity: 75,
      images: [],
      categoryId: accessories.id,
    },
    {
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
      price: 59.99,
      sku: 'UCH-006',
      quantity: 40,
      images: [],
      categoryId: accessories.id,
    },
    {
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand for better ergonomics',
      price: 34.99,
      sku: 'LPS-007',
      quantity: 60,
      images: [],
      categoryId: office.id,
    },
    {
      name: 'Desk Organizer',
      description: 'Bamboo desk organizer with multiple compartments',
      price: 24.99,
      sku: 'DSO-008',
      quantity: 80,
      images: [],
      categoryId: office.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        ...product,
        storeId: store.id,
      },
    })
  }

  console.log(`✅ Created ${products.length} products`)

  // Create a test buyer user
  const buyerPassword = await hashPassword('buyer123')
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      password: buyerPassword,
      name: 'Test Buyer',
      role: 'BUYER',
    },
  })

  console.log('✅ Created buyer:', buyer.email)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Test accounts:')
  console.log('  Admin:  admin@example.com / admin123')
  console.log('  Seller: seller@example.com / seller123')
  console.log('  Buyer:  buyer@example.com / buyer123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
