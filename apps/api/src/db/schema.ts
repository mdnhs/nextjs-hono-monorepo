import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  json,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const userRoleEnum = pgEnum('UserRole', ['BUYER', 'SELLER', 'ADMIN'])
export const storeStatusEnum = pgEnum('StoreStatus', ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])
export const orderStatusEnum = pgEnum('OrderStatus', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
export const billingCycleEnum = pgEnum('BillingCycle', ['MONTHLY', 'YEARLY'])
export const subscriptionStatusEnum = pgEnum('SubscriptionStatus', ['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL', 'PAST_DUE'])
export const planStatusEnum = pgEnum('PlanStatus', ['ACTIVE', 'HIDDEN'])

export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type StoreStatus = (typeof storeStatusEnum.enumValues)[number]
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type BillingCycle = (typeof billingCycleEnum.enumValues)[number]
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number]
export type PlanStatus = (typeof planStatusEnum.enumValues)[number]

export const users = pgTable('User', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('SELLER'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
})

export const plans = pgTable('Plan', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  status: planStatusEnum('status').notNull().default('ACTIVE'),
  priceMonthly: numeric('priceMonthly', { precision: 10, scale: 2 }).notNull().default('0'),
  priceYearly: numeric('priceYearly', { precision: 10, scale: 2 }).notNull().default('0'),
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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
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
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  parentId: text('parentId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Category_parentId_idx').on(t.parentId),
])

export const products = pgTable('Product', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  images: text('images').array().notNull().default([]),
  sku: text('sku').unique().notNull(),
  quantity: integer('quantity').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id),
  categoryId: text('categoryId').references(() => categories.id),
}, (t) => [
  index('Product_storeId_idx').on(t.storeId),
  index('Product_categoryId_idx').on(t.categoryId),
  index('Product_isActive_idx').on(t.isActive),
])

export const carts = pgTable('Cart', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId')
    .unique()
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
})

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
}, (t) => [
  uniqueIndex('CartItem_cartId_productId_key').on(t.cartId, t.productId),
  index('CartItem_cartId_idx').on(t.cartId),
  index('CartItem_productId_idx').on(t.productId),
])

export const orders = pgTable('Order', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  orderNumber: text('orderNumber')
    .unique()
    .notNull()
    .$defaultFn(() => createId()),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  storeId: text('storeId')
    .notNull()
    .references(() => stores.id),
}, (t) => [
  index('Order_userId_idx').on(t.userId),
  index('Order_storeId_idx').on(t.storeId),
  index('Order_status_idx').on(t.status),
])

export const orderItems = pgTable('OrderItem', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  orderId: text('orderId')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('productId')
    .notNull()
    .references(() => products.id),
}, (t) => [
  index('OrderItem_orderId_idx').on(t.orderId),
  index('OrderItem_productId_idx').on(t.productId),
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
