import { relations } from 'drizzle-orm'
import {
  users,
  customers,
  stores,
  products,
  productVariants,
  categories,
  carts,
  cartItems,
  orders,
  orderItems,
  shippingAddresses,
  reviews,
  reviewHelpfuls,
  plans,
  subscriptions,
  payments,
  refunds,
  webhooks,
  webhookDeliveries,
} from './schema'

export const usersRelations = relations(users, ({ many, one }) => ({
  stores: many(stores),
  orders: many(orders),
  cart: one(carts, { fields: [users.id], references: [carts.userId] }),
  reviews: many(reviews),
  reviewHelpfulVotes: many(reviewHelpfuls),
}))

export const customersRelations = relations(customers, ({ one }) => ({
  store: one(stores, { fields: [customers.storeId], references: [stores.id] }),
}))

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}))

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
  subscriptions: many(subscriptions),
  customers: many(customers),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  store: one(stores, { fields: [subscriptions.storeId], references: [stores.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'CategoryChildren',
  }),
  children: many(categories, { relationName: 'CategoryChildren' }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  reviews: many(reviews),
}))

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}))

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  store: one(stores, { fields: [orders.storeId], references: [stores.id] }),
  items: many(orderItems),
  shippingAddress: one(shippingAddresses, {
    fields: [orders.id],
    references: [shippingAddresses.orderId],
  }),
  reviews: many(reviews),
  payments: many(payments),
}))

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  store: one(stores, { fields: [payments.storeId], references: [stores.id] }),
  refunds: many(refunds),
}))

export const refundsRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, { fields: [refunds.paymentId], references: [payments.id] }),
}))

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  store: one(stores, { fields: [webhooks.storeId], references: [stores.id] }),
  deliveries: many(webhookDeliveries),
}))

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookDeliveries.webhookId], references: [webhooks.id] }),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}))

export const shippingAddressesRelations = relations(shippingAddresses, ({ one }) => ({
  order: one(orders, { fields: [shippingAddresses.orderId], references: [orders.id] }),
}))

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  helpfulVotes: many(reviewHelpfuls),
}))

export const reviewHelpfulsRelations = relations(reviewHelpfuls, ({ one }) => ({
  user: one(users, { fields: [reviewHelpfuls.userId], references: [users.id] }),
  review: one(reviews, { fields: [reviewHelpfuls.reviewId], references: [reviews.id] }),
}))
