import { relations } from 'drizzle-orm'
import {
  users,
  stores,
  products,
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
} from './schema'

export const usersRelations = relations(users, ({ many, one }) => ({
  stores: many(stores),
  orders: many(orders),
  cart: one(carts, { fields: [users.id], references: [carts.userId] }),
  reviews: many(reviews),
  reviewHelpfulVotes: many(reviewHelpfuls),
}))

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}))

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, { fields: [stores.ownerId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
  subscriptions: many(subscriptions),
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
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  reviews: many(reviews),
}))

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
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
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
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
