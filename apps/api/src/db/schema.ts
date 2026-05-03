import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  numeric,
  pgEnum,
  json,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export const userRoleEnum = pgEnum('UserRole', ['BUYER', 'STORE_ADMIN', 'SELLER', 'PLATFORM_ADMIN'])
export const storeStatusEnum = pgEnum('StoreStatus', ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])
export const orderStatusEnum = pgEnum('OrderStatus', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
export const billingCycleEnum = pgEnum('BillingCycle', ['MONTHLY', 'YEARLY'])
export const subscriptionStatusEnum = pgEnum('SubscriptionStatus', ['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL', 'PAST_DUE'])
export const planStatusEnum = pgEnum('PlanStatus', ['ACTIVE', 'HIDDEN'])
export const paymentStatusEnum = pgEnum('PaymentStatus', [
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
])
export const paymentProviderEnum = pgEnum('PaymentProvider', ['STRIPE', 'SSLCOMMERZ', 'MANUAL'])

export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type StoreStatus = (typeof storeStatusEnum.enumValues)[number]
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type BillingCycle = (typeof billingCycleEnum.enumValues)[number]
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number]
export type PlanStatus = (typeof planStatusEnum.enumValues)[number]
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number]
export type PaymentProvider = (typeof paymentProviderEnum.enumValues)[number]

export const users = pgTable('User', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('SELLER'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
})

// Per-store buyer accounts. Different store + same email = different customer.
export const customers = pgTable('Customer', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  passwordHash: text('passwordHash'),
  name: text('name'),
  phone: text('phone'),
  emailVerifiedAt: timestamp('emailVerifiedAt'),
  acceptsMarketing: boolean('acceptsMarketing').notNull().default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
}, (t) => [
  uniqueIndex('Customer_storeId_email_key').on(t.storeId, t.email),
  index('Customer_storeId_idx').on(t.storeId),
])

export const plans = pgTable('Plan', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  status: planStatusEnum('status').notNull().default('ACTIVE'),
  priceMonthly: numeric('priceMonthly', { precision: 10, scale: 2 }).notNull().default('0'),
  priceYearly: numeric('priceYearly', { precision: 10, scale: 2 }).notNull().default('0'),
  // Canonical money: integer cents.
  priceMonthlyCents: bigint('priceMonthlyCents', { mode: 'bigint' }).notNull().default(sql`0`),
  priceYearlyCents: bigint('priceYearlyCents', { mode: 'bigint' }).notNull().default(sql`0`),
  currency: text('currency').notNull().default('USD'),
  trialDays: integer('trialDays').notNull().default(0),
  maxStores: integer('maxStores'),
  maxProducts: integer('maxProducts'),
  maxOrders: integer('maxOrders'),
  maxStorageMB: integer('maxStorageMB').notNull().default(100),
  customDomain: boolean('customDomain').notNull().default(false),
  analytics: boolean('analytics').notNull().default(false),
  prioritySupport: boolean('prioritySupport').notNull().default(false),
  removeBranding: boolean('removeBranding').notNull().default(false),
  apiAccess: boolean('apiAccess').notNull().default(false),
  features: json('features').notNull().default({}),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
})

export const stores = pgTable('Store', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  logo: text('logo'),
  status: storeStatusEnum('status').notNull().default('PENDING'),
  customDomain: text('customDomain').unique(),
  // Storefront default currency (ISO 4217). Overridable at order time.
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
  ownerId: text('ownerId')
    .notNull()
    .references(() => users.id),
}, (t) => [
  index('Store_ownerId_idx').on(t.ownerId),
  index('Store_status_idx').on(t.status),
  index('Store_slug_idx').on(t.slug),
])

export const subscriptions = pgTable('Subscription', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  status: subscriptionStatusEnum('status').notNull().default('TRIAL'),
  billingCycle: billingCycleEnum('billingCycle').notNull().default('MONTHLY'),
  currentPeriodStart: timestamp('currentPeriodStart').notNull(),
  currentPeriodEnd: timestamp('currentPeriodEnd').notNull(),
  cancelledAt: timestamp('cancelledAt'),
  expiresAt: timestamp('expiresAt'),
  storeId: text('storeId')
    .unique()
    .notNull()
    .references(() => stores.id),
  planId: text('planId')
    .notNull()
    .references(() => plans.id),
}, (t) => [
  index('Subscription_status_idx').on(t.status),
  index('Subscription_storeId_idx').on(t.storeId),
  index('Subscription_planId_idx').on(t.planId),
])

export const categories = pgTable('Category', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  parentId: text('parentId'),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
}, (t) => [
  uniqueIndex('Category_storeId_name_key').on(t.storeId, t.name),
  uniqueIndex('Category_storeId_slug_key').on(t.storeId, t.slug),
  index('Category_parentId_idx').on(t.parentId),
  index('Category_storeId_idx').on(t.storeId),
])

export const locations = pgTable('Location', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  address: text('address'),
  isDefault: boolean('isDefault').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
}, (t) => [
  index('Location_storeId_idx').on(t.storeId),
])

export const inventoryLevels = pgTable('InventoryLevel', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  variantId: text('variantId')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
  locationId: text('locationId')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),
  available: integer('available').notNull().default(0),
  reserved: integer('reserved').notNull().default(0),
  onHand: integer('onHand').notNull().default(0), // available + reserved
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex('InventoryLevel_variantId_locationId_key').on(t.variantId, t.locationId),
  index('InventoryLevel_variantId_idx').on(t.variantId),
  index('InventoryLevel_locationId_idx').on(t.locationId),
])

export const inventoryTransactions = pgTable('InventoryTransaction', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  inventoryLevelId: text('inventoryLevelId')
    .notNull()
    .references(() => inventoryLevels.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'ADJUSTMENT', 'SALE', 'RETURN', 'TRANSFER', 'RESERVATION'
  quantity: integer('quantity').notNull(),
  reason: text('reason'),
  referenceId: text('referenceId'), // e.g. orderId
  referenceType: text('referenceType'), // e.g. 'ORDER'
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (t) => [
  index('InventoryTransaction_inventoryLevelId_idx').on(t.inventoryLevelId),
])

export const discounts = pgTable('Discount', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  type: text('type').notNull(), // 'PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  valueCents: bigint('valueCents', { mode: 'bigint' }), // for FIXED_AMOUNT
  startsAt: timestamp('startsAt').notNull(),
  endsAt: timestamp('endsAt'),
  usageLimit: integer('usageLimit'),
  usageCount: integer('usageCount').notNull().default(0),
  minOrderAmountCents: bigint('minOrderAmountCents', { mode: 'bigint' }),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
}, (t) => [
  uniqueIndex('Discount_storeId_code_key').on(t.storeId, t.code),
  index('Discount_storeId_idx').on(t.storeId),
])

export const shippingRates = pgTable('ShippingRate', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'FLAT', 'WEIGHT_BASED', 'PRICE_BASED'
  priceCents: bigint('priceCents', { mode: 'bigint' }).notNull(),
  minWeightGrams: integer('minWeightGrams'),
  maxWeightGrams: integer('maxWeightGrams'),
  minOrderAmountCents: bigint('minOrderAmountCents', { mode: 'bigint' }),
  maxOrderAmountCents: bigint('maxOrderAmountCents', { mode: 'bigint' }),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('ShippingRate_storeId_idx').on(t.storeId),
])

export const taxRates = pgTable('TaxRate', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(),
  country: text('country').notNull(),
  state: text('state'),
  zip: text('zip'),
  isInclusive: boolean('isInclusive').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('TaxRate_storeId_idx').on(t.storeId),
])

export const products = pgTable('Product', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  // Legacy money columns (kept in sync with default variant). Use priceCents going forward.
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  // Canonical money: integer cents on default variant. Synced from productVariants.
  priceCents: bigint('priceCents', { mode: 'bigint' }),
  currency: text('currency'),
  images: text('images').array().notNull().default([]),
  sku: text('sku').unique().notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id),
  categoryId: text('categoryId').references(() => categories.id),
}, (t) => [
  index('Product_storeId_idx').on(t.storeId),
  index('Product_categoryId_idx').on(t.categoryId),
  index('Product_isActive_idx').on(t.isActive),
])

// SKU-level entity. Each product has >= 1 variant. Default variant mirrors product columns.
export const productVariants = pgTable('ProductVariant', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  productId: text('productId')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').notNull(),
  name: text('name'),
  // jsonb of selected options, e.g. { Size: 'M', Color: 'Red' }
  options: jsonb('options').notNull().default({}),
  priceCents: bigint('priceCents', { mode: 'bigint' }).notNull(),
  compareAtPriceCents: bigint('compareAtPriceCents', { mode: 'bigint' }),
  currency: text('currency').notNull().default('USD'),
  // Legacy mirror of priceCents.
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  weightGrams: integer('weightGrams'),
  barcode: text('barcode'),
  isDefault: boolean('isDefault').notNull().default(false),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
}, (t) => [
  uniqueIndex('ProductVariant_sku_key').on(t.sku),
  index('ProductVariant_productId_idx').on(t.productId),
  index('ProductVariant_isDefault_idx').on(t.isDefault),
])

export const carts = pgTable('Cart', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id, { onDelete: 'cascade' }),
  customerId: text('customerId').references(() => customers.id, { onDelete: 'cascade' }),
  cartToken: text('cartToken').unique(),
  // Legacy: pre-multi-tenant cart bound to platform User. Nullable now; remove once data migrated.
  userId: text('userId').references(() => users.id),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex('Cart_storeId_customerId_uq').on(t.storeId, t.customerId),
  index('Cart_storeId_idx').on(t.storeId),
  index('Cart_customerId_idx').on(t.customerId),
  index('Cart_cartToken_idx').on(t.cartToken),
])

export const cartItems = pgTable('CartItem', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  cartId: text('cartId')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  productId: text('productId')
    .notNull()
    .references(() => products.id),
  // Variant the customer chose. Nullable for backward compat — defaults resolve to product's default variant at read time.
  variantId: text('variantId').references(() => productVariants.id),
}, (t) => [
  // Same product can appear with different variants; uniqueness is per (cart, variant).
  uniqueIndex('CartItem_cartId_variantId_key').on(t.cartId, t.variantId),
  index('CartItem_cartId_idx').on(t.cartId),
  index('CartItem_productId_idx').on(t.productId),
  index('CartItem_variantId_idx').on(t.variantId),
])

export const orders = pgTable('Order', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  orderNumber: text('orderNumber')
    .unique()
    .notNull()
    .$defaultFn(() => createId()),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  // Canonical money. Synced from total.
  totalCents: bigint('totalCents', { mode: 'bigint' }),
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
  // Legacy: order placed by a platform User (seller test orders, internal). Now nullable.
  userId: text('userId').references(() => users.id),
  customerId: text('customerId').references(() => customers.id),
  // Snapshot of guest contact when no customer record exists yet.
  guestEmail: text('guestEmail'),
  guestName: text('guestName'),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id),
}, (t) => [
  index('Order_userId_idx').on(t.userId),
  index('Order_customerId_idx').on(t.customerId),
  index('Order_storeId_idx').on(t.storeId),
  index('Order_status_idx').on(t.status),
])

export const orderItems = pgTable('OrderItem', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  priceCents: bigint('priceCents', { mode: 'bigint' }),
  currency: text('currency'),
  orderId: text('orderId')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('productId')
    .notNull()
    .references(() => products.id),
  variantId: text('variantId').references(() => productVariants.id),
}, (t) => [
  index('OrderItem_orderId_idx').on(t.orderId),
  index('OrderItem_productId_idx').on(t.productId),
  index('OrderItem_variantId_idx').on(t.variantId),
])

export const shippingAddresses = pgTable('ShippingAddress', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postalCode').notNull(),
  country: text('country').notNull(),
  phone: text('phone').notNull(),
  orderId: text('orderId')
    .unique()
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
})

export const reviews = pgTable('Review', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  rating: integer('rating').notNull(),
  title: text('title'),
  comment: text('comment').notNull(),
  images: text('images').array().notNull().default([]),
  verifiedPurchase: boolean('verifiedPurchase').notNull().default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  productId: text('productId')
    .notNull()
    .references(() => products.id),
  orderId: text('orderId').references(() => orders.id),
}, (t) => [
  index('Review_productId_idx').on(t.productId),
  index('Review_userId_idx').on(t.userId),
  index('Review_rating_idx').on(t.rating),
])

export const payments = pgTable('Payment', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  storeId: text('storeId').notNull().references(() => stores.id),
  provider: paymentProviderEnum('provider').notNull(),
  // Provider's id for the intent/charge (e.g. Stripe pi_xxx, SSLCommerz tran_id)
  providerRef: text('providerRef'),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  amountCents: bigint('amountCents', { mode: 'bigint' }).notNull(),
  currency: text('currency').notNull(),
  // Raw provider payload — useful for debugging + audits.
  providerData: jsonb('providerData'),
  errorMessage: text('errorMessage'),
  authorizedAt: timestamp('authorizedAt'),
  capturedAt: timestamp('capturedAt'),
  failedAt: timestamp('failedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Payment_orderId_idx').on(t.orderId),
  index('Payment_storeId_idx').on(t.storeId),
  index('Payment_status_idx').on(t.status),
  index('Payment_providerRef_idx').on(t.providerRef),
])

export const refunds = pgTable('Refund', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  paymentId: text('paymentId').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  providerRef: text('providerRef'),
  amountCents: bigint('amountCents', { mode: 'bigint' }).notNull(),
  currency: text('currency').notNull(),
  reason: text('reason'),
  providerData: jsonb('providerData'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (t) => [
  index('Refund_paymentId_idx').on(t.paymentId),
])

// Outbound webhooks: per-store subscriptions to events.
export const webhooks = pgTable('Webhook', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
  url: text('url').notNull(),
  // HMAC-SHA256 signing secret. Generated once; revealed on creation only.
  secret: text('secret').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  deletedAt: timestamp('deletedAt'),
}, (t) => [
  index('Webhook_storeId_idx').on(t.storeId),
  index('Webhook_topic_idx').on(t.topic),
])

export const webhookDeliveries = pgTable('WebhookDelivery', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  webhookId: text('webhookId').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('responseStatus'),
  responseBody: text('responseBody'),
  errorMessage: text('errorMessage'),
  attempt: integer('attempt').notNull().default(1),
  succeeded: boolean('succeeded').notNull().default(false),
  deliveredAt: timestamp('deliveredAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (t) => [
  index('WebhookDelivery_webhookId_idx').on(t.webhookId),
  index('WebhookDelivery_succeeded_idx').on(t.succeeded),
])

export const idempotencyKeys = pgTable('IdempotencyKey', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  // Composite logical key: scope + key (e.g. "user:abc123|abc-def-uuid")
  scope: text('scope').notNull(),
  key: text('key').notNull(),
  // SHA-256 of method+path+body. Mismatch on same key = 422.
  requestHash: text('requestHash').notNull(),
  responseStatus: integer('responseStatus'),
  responseBody: jsonb('responseBody'),
  // Locked while in-flight; released on completion. NULL when complete.
  lockedAt: timestamp('lockedAt'),
  completedAt: timestamp('completedAt'),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('IdempotencyKey_scope_key_uq').on(t.scope, t.key),
  index('IdempotencyKey_expiresAt_idx').on(t.expiresAt),
])

export const reviewHelpfuls = pgTable('ReviewHelpful', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  helpful: boolean('helpful').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  reviewId: text('reviewId')
    .notNull()
    .references(() => reviews.id, { onDelete: 'cascade' }),
}, (t) => [
  uniqueIndex('ReviewHelpful_userId_reviewId_key').on(t.userId, t.reviewId),
  index('ReviewHelpful_reviewId_idx').on(t.reviewId),
])

export const storeStaffRoleEnum = pgEnum('StoreStaffRole', ['MANAGER', 'EDITOR', 'SUPPORT'])
export type StoreStaffRole = (typeof storeStaffRoleEnum.enumValues)[number]

export const storeStaffs = pgTable('StoreStaff', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: storeStaffRoleEnum('role').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex('StoreStaff_storeId_userId_key').on(t.storeId, t.userId),
  index('StoreStaff_storeId_idx').on(t.storeId),
  index('StoreStaff_userId_idx').on(t.userId),
])

// Page-level theme content. Each store has many themes; only one is `isPublished`.
// Theme = ordered list of Sections, Section = ordered list of Blocks. Both carry JSON settings.
export const themes = pgTable('Theme', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isPublished: boolean('isPublished').notNull().default(false),
  // Theme-wide settings (palette overrides, layout flags). Section/block configs live in their own rows.
  settings: jsonb('settings').notNull().default({}),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Theme_storeId_idx').on(t.storeId),
  index('Theme_isPublished_idx').on(t.isPublished),
])

export const themeSections = pgTable('ThemeSection', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  themeId: text('themeId').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  // Free-form handle that maps to a frontend component, e.g. 'hero', 'product_grid', 'rich_text'.
  type: text('type').notNull(),
  settings: jsonb('settings').notNull().default({}),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('ThemeSection_themeId_idx').on(t.themeId),
  index('ThemeSection_position_idx').on(t.themeId, t.position),
])

export const themeBlocks = pgTable('ThemeBlock', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sectionId: text('sectionId').notNull().references(() => themeSections.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // e.g. 'heading', 'button', 'image', 'rich_text'
  settings: jsonb('settings').notNull().default({}),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('ThemeBlock_sectionId_idx').on(t.sectionId),
  index('ThemeBlock_position_idx').on(t.sectionId, t.position),
])

export const themeSettings = pgTable('ThemeSetting', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').unique().notNull().references(() => stores.id, { onDelete: 'cascade' }),
  colors: jsonb('colors').notNull().default({ primary: '#000000', secondary: '#ffffff' }),
  fonts: jsonb('fonts').notNull().default({ heading: 'Inter', body: 'Inter' }),
  layout: jsonb('layout').notNull().default({ header: 'default', footer: 'default' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
})

export const pages = pgTable('Page', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content'),
  isPublished: boolean('isPublished').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex('Page_storeId_slug_key').on(t.storeId, t.slug),
  index('Page_storeId_idx').on(t.storeId),
])

export const navigations = pgTable('Navigation', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  handle: text('handle').notNull(), // e.g. 'main-menu', 'footer-menu'
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex('Navigation_storeId_handle_key').on(t.storeId, t.handle),
  index('Navigation_storeId_idx').on(t.storeId),
])

export const navigationItems = pgTable('NavigationItem', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  navigationId: text('navigationId').notNull().references(() => navigations.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  url: text('url').notNull(),
  parentId: text('parentId'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('NavigationItem_navigationId_idx').on(t.navigationId),
])

export const domainVerificationStatusEnum = pgEnum('DomainVerificationStatus', [
  'PENDING',
  'VERIFIED',
  'FAILED',
])
export type DomainVerificationStatus = (typeof domainVerificationStatusEnum.enumValues)[number]

// Tracks the seller's claim on a custom domain. Status flips to VERIFIED only when DNS TXT
// at `_saas-verify.<hostname>` matches our token. Once verified we set Store.customDomain.
export const domainVerifications = pgTable('DomainVerification', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  hostname: text('hostname').notNull(),
  // High-entropy random token. Sellers paste this verbatim into their TXT record.
  txtToken: text('txtToken').notNull(),
  status: domainVerificationStatusEnum('status').notNull().default('PENDING'),
  attempts: integer('attempts').notNull().default(0),
  lastCheckedAt: timestamp('lastCheckedAt'),
  verifiedAt: timestamp('verifiedAt'),
  failureReason: text('failureReason'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  uniqueIndex('DomainVerification_hostname_uq').on(t.hostname),
  index('DomainVerification_storeId_idx').on(t.storeId),
  index('DomainVerification_status_idx').on(t.status),
])

export const assets = pgTable('Asset', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storeId: text('storeId').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: text('type').notNull(), // 'IMAGE', 'VIDEO', 'DOCUMENT'
  sizeBytes: integer('sizeBytes').notNull(),
  fileName: text('fileName'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, (t) => [
  index('Asset_storeId_idx').on(t.storeId),
])
