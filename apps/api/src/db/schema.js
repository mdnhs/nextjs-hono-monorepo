"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewHelpfuls = exports.reviews = exports.shippingAddresses = exports.orderItems = exports.orders = exports.cartItems = exports.carts = exports.products = exports.categories = exports.subscriptions = exports.stores = exports.plans = exports.users = exports.planStatusEnum = exports.subscriptionStatusEnum = exports.billingCycleEnum = exports.orderStatusEnum = exports.storeStatusEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const cuid2_1 = require("@paralleldrive/cuid2");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('UserRole', ['BUYER', 'SELLER', 'ADMIN']);
exports.storeStatusEnum = (0, pg_core_1.pgEnum)('StoreStatus', ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('OrderStatus', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']);
exports.billingCycleEnum = (0, pg_core_1.pgEnum)('BillingCycle', ['MONTHLY', 'YEARLY']);
exports.subscriptionStatusEnum = (0, pg_core_1.pgEnum)('SubscriptionStatus', ['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL', 'PAST_DUE']);
exports.planStatusEnum = (0, pg_core_1.pgEnum)('PlanStatus', ['ACTIVE', 'HIDDEN']);
exports.users = (0, pg_core_1.pgTable)('User', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    email: (0, pg_core_1.text)('email').unique().notNull(),
    password: (0, pg_core_1.text)('password').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    role: (0, exports.userRoleEnum)('role').notNull().default('SELLER'),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
});
exports.plans = (0, pg_core_1.pgTable)('Plan', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.text)('name').unique().notNull(),
    slug: (0, pg_core_1.text)('slug').unique().notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, exports.planStatusEnum)('status').notNull().default('ACTIVE'),
    priceMonthly: (0, pg_core_1.numeric)('priceMonthly', { precision: 10, scale: 2 }).notNull().default('0'),
    priceYearly: (0, pg_core_1.numeric)('priceYearly', { precision: 10, scale: 2 }).notNull().default('0'),
    trialDays: (0, pg_core_1.integer)('trialDays').notNull().default(0),
    maxStores: (0, pg_core_1.integer)('maxStores'),
    maxProducts: (0, pg_core_1.integer)('maxProducts'),
    maxOrders: (0, pg_core_1.integer)('maxOrders'),
    maxStorageMB: (0, pg_core_1.integer)('maxStorageMB').notNull().default(100),
    customDomain: (0, pg_core_1.boolean)('customDomain').notNull().default(false),
    analytics: (0, pg_core_1.boolean)('analytics').notNull().default(false),
    prioritySupport: (0, pg_core_1.boolean)('prioritySupport').notNull().default(false),
    removeBranding: (0, pg_core_1.boolean)('removeBranding').notNull().default(false),
    apiAccess: (0, pg_core_1.boolean)('apiAccess').notNull().default(false),
    features: (0, pg_core_1.json)('features').notNull().default({}),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
});
exports.stores = (0, pg_core_1.pgTable)('Store', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    slug: (0, pg_core_1.text)('slug').unique().notNull(),
    logo: (0, pg_core_1.text)('logo'),
    status: (0, exports.storeStatusEnum)('status').notNull().default('PENDING'),
    customDomain: (0, pg_core_1.text)('customDomain').unique(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
    ownerId: (0, pg_core_1.text)('ownerId')
        .notNull()
        .references(() => exports.users.id),
}, (t) => [
    (0, pg_core_1.index)('Store_ownerId_idx').on(t.ownerId),
    (0, pg_core_1.index)('Store_status_idx').on(t.status),
    (0, pg_core_1.index)('Store_slug_idx').on(t.slug),
]);
exports.subscriptions = (0, pg_core_1.pgTable)('Subscription', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    status: (0, exports.subscriptionStatusEnum)('status').notNull().default('TRIAL'),
    billingCycle: (0, exports.billingCycleEnum)('billingCycle').notNull().default('MONTHLY'),
    currentPeriodStart: (0, pg_core_1.timestamp)('currentPeriodStart').notNull(),
    currentPeriodEnd: (0, pg_core_1.timestamp)('currentPeriodEnd').notNull(),
    cancelledAt: (0, pg_core_1.timestamp)('cancelledAt'),
    expiresAt: (0, pg_core_1.timestamp)('expiresAt'),
    storeId: (0, pg_core_1.text)('storeId')
        .unique()
        .notNull()
        .references(() => exports.stores.id),
    planId: (0, pg_core_1.text)('planId')
        .notNull()
        .references(() => exports.plans.id),
}, (t) => [
    (0, pg_core_1.index)('Subscription_status_idx').on(t.status),
    (0, pg_core_1.index)('Subscription_storeId_idx').on(t.storeId),
    (0, pg_core_1.index)('Subscription_planId_idx').on(t.planId),
]);
exports.categories = (0, pg_core_1.pgTable)('Category', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.text)('name').unique().notNull(),
    slug: (0, pg_core_1.text)('slug').unique().notNull(),
    description: (0, pg_core_1.text)('description'),
    parentId: (0, pg_core_1.text)('parentId'),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (t) => [
    (0, pg_core_1.index)('Category_parentId_idx').on(t.parentId),
]);
exports.products = (0, pg_core_1.pgTable)('Product', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.numeric)('price', { precision: 10, scale: 2 }).notNull(),
    images: (0, pg_core_1.text)('images').array().notNull().default([]),
    sku: (0, pg_core_1.text)('sku').unique().notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(0),
    isActive: (0, pg_core_1.boolean)('isActive').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
    storeId: (0, pg_core_1.text)('storeId')
        .notNull()
        .references(() => exports.stores.id),
    categoryId: (0, pg_core_1.text)('categoryId').references(() => exports.categories.id),
}, (t) => [
    (0, pg_core_1.index)('Product_storeId_idx').on(t.storeId),
    (0, pg_core_1.index)('Product_categoryId_idx').on(t.categoryId),
    (0, pg_core_1.index)('Product_isActive_idx').on(t.isActive),
]);
exports.carts = (0, pg_core_1.pgTable)('Cart', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, pg_core_1.text)('userId')
        .unique()
        .notNull()
        .references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
});
exports.cartItems = (0, pg_core_1.pgTable)('CartItem', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
    cartId: (0, pg_core_1.text)('cartId')
        .notNull()
        .references(() => exports.carts.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.text)('productId')
        .notNull()
        .references(() => exports.products.id),
}, (t) => [
    (0, pg_core_1.uniqueIndex)('CartItem_cartId_productId_key').on(t.cartId, t.productId),
    (0, pg_core_1.index)('CartItem_cartId_idx').on(t.cartId),
    (0, pg_core_1.index)('CartItem_productId_idx').on(t.productId),
]);
exports.orders = (0, pg_core_1.pgTable)('Order', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    orderNumber: (0, pg_core_1.text)('orderNumber')
        .unique()
        .notNull()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    status: (0, exports.orderStatusEnum)('status').notNull().default('PENDING'),
    total: (0, pg_core_1.numeric)('total', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
    userId: (0, pg_core_1.text)('userId')
        .notNull()
        .references(() => exports.users.id),
    storeId: (0, pg_core_1.text)('storeId')
        .notNull()
        .references(() => exports.stores.id),
}, (t) => [
    (0, pg_core_1.index)('Order_userId_idx').on(t.userId),
    (0, pg_core_1.index)('Order_storeId_idx').on(t.storeId),
    (0, pg_core_1.index)('Order_status_idx').on(t.status),
]);
exports.orderItems = (0, pg_core_1.pgTable)('OrderItem', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    price: (0, pg_core_1.numeric)('price', { precision: 10, scale: 2 }).notNull(),
    orderId: (0, pg_core_1.text)('orderId')
        .notNull()
        .references(() => exports.orders.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.text)('productId')
        .notNull()
        .references(() => exports.products.id),
}, (t) => [
    (0, pg_core_1.index)('OrderItem_orderId_idx').on(t.orderId),
    (0, pg_core_1.index)('OrderItem_productId_idx').on(t.productId),
]);
exports.shippingAddresses = (0, pg_core_1.pgTable)('ShippingAddress', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    street: (0, pg_core_1.text)('street').notNull(),
    city: (0, pg_core_1.text)('city').notNull(),
    state: (0, pg_core_1.text)('state').notNull(),
    postalCode: (0, pg_core_1.text)('postalCode').notNull(),
    country: (0, pg_core_1.text)('country').notNull(),
    phone: (0, pg_core_1.text)('phone').notNull(),
    orderId: (0, pg_core_1.text)('orderId')
        .unique()
        .notNull()
        .references(() => exports.orders.id, { onDelete: 'cascade' }),
});
exports.reviews = (0, pg_core_1.pgTable)('Review', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    rating: (0, pg_core_1.integer)('rating').notNull(),
    title: (0, pg_core_1.text)('title'),
    comment: (0, pg_core_1.text)('comment').notNull(),
    images: (0, pg_core_1.text)('images').array().notNull().default([]),
    verifiedPurchase: (0, pg_core_1.boolean)('verifiedPurchase').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull().$onUpdateFn(() => new Date()),
    userId: (0, pg_core_1.text)('userId')
        .notNull()
        .references(() => exports.users.id),
    productId: (0, pg_core_1.text)('productId')
        .notNull()
        .references(() => exports.products.id),
    orderId: (0, pg_core_1.text)('orderId').references(() => exports.orders.id),
}, (t) => [
    (0, pg_core_1.index)('Review_productId_idx').on(t.productId),
    (0, pg_core_1.index)('Review_userId_idx').on(t.userId),
    (0, pg_core_1.index)('Review_rating_idx').on(t.rating),
]);
exports.reviewHelpfuls = (0, pg_core_1.pgTable)('ReviewHelpful', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    helpful: (0, pg_core_1.boolean)('helpful').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    userId: (0, pg_core_1.text)('userId')
        .notNull()
        .references(() => exports.users.id),
    reviewId: (0, pg_core_1.text)('reviewId')
        .notNull()
        .references(() => exports.reviews.id, { onDelete: 'cascade' }),
}, (t) => [
    (0, pg_core_1.uniqueIndex)('ReviewHelpful_userId_reviewId_key').on(t.userId, t.reviewId),
    (0, pg_core_1.index)('ReviewHelpful_reviewId_idx').on(t.reviewId),
]);
