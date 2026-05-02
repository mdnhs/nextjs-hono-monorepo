"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewHelpfulsRelations = exports.reviewsRelations = exports.shippingAddressesRelations = exports.orderItemsRelations = exports.ordersRelations = exports.cartItemsRelations = exports.cartsRelations = exports.productsRelations = exports.categoriesRelations = exports.subscriptionsRelations = exports.storesRelations = exports.plansRelations = exports.usersRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
exports.usersRelations = (0, drizzle_orm_1.relations)(schema_1.users, ({ many, one }) => ({
    stores: many(schema_1.stores),
    orders: many(schema_1.orders),
    cart: one(schema_1.carts, { fields: [schema_1.users.id], references: [schema_1.carts.userId] }),
    reviews: many(schema_1.reviews),
    reviewHelpfulVotes: many(schema_1.reviewHelpfuls),
}));
exports.plansRelations = (0, drizzle_orm_1.relations)(schema_1.plans, ({ many }) => ({
    subscriptions: many(schema_1.subscriptions),
}));
exports.storesRelations = (0, drizzle_orm_1.relations)(schema_1.stores, ({ one, many }) => ({
    owner: one(schema_1.users, { fields: [schema_1.stores.ownerId], references: [schema_1.users.id] }),
    products: many(schema_1.products),
    orders: many(schema_1.orders),
    subscriptions: many(schema_1.subscriptions),
}));
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(schema_1.subscriptions, ({ one }) => ({
    store: one(schema_1.stores, { fields: [schema_1.subscriptions.storeId], references: [schema_1.stores.id] }),
    plan: one(schema_1.plans, { fields: [schema_1.subscriptions.planId], references: [schema_1.plans.id] }),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(schema_1.categories, ({ one, many }) => ({
    parent: one(schema_1.categories, {
        fields: [schema_1.categories.parentId],
        references: [schema_1.categories.id],
        relationName: 'CategoryChildren',
    }),
    children: many(schema_1.categories, { relationName: 'CategoryChildren' }),
    products: many(schema_1.products),
}));
exports.productsRelations = (0, drizzle_orm_1.relations)(schema_1.products, ({ one, many }) => ({
    store: one(schema_1.stores, { fields: [schema_1.products.storeId], references: [schema_1.stores.id] }),
    category: one(schema_1.categories, { fields: [schema_1.products.categoryId], references: [schema_1.categories.id] }),
    orderItems: many(schema_1.orderItems),
    cartItems: many(schema_1.cartItems),
    reviews: many(schema_1.reviews),
}));
exports.cartsRelations = (0, drizzle_orm_1.relations)(schema_1.carts, ({ one, many }) => ({
    user: one(schema_1.users, { fields: [schema_1.carts.userId], references: [schema_1.users.id] }),
    items: many(schema_1.cartItems),
}));
exports.cartItemsRelations = (0, drizzle_orm_1.relations)(schema_1.cartItems, ({ one }) => ({
    cart: one(schema_1.carts, { fields: [schema_1.cartItems.cartId], references: [schema_1.carts.id] }),
    product: one(schema_1.products, { fields: [schema_1.cartItems.productId], references: [schema_1.products.id] }),
}));
exports.ordersRelations = (0, drizzle_orm_1.relations)(schema_1.orders, ({ one, many }) => ({
    user: one(schema_1.users, { fields: [schema_1.orders.userId], references: [schema_1.users.id] }),
    store: one(schema_1.stores, { fields: [schema_1.orders.storeId], references: [schema_1.stores.id] }),
    items: many(schema_1.orderItems),
    shippingAddress: one(schema_1.shippingAddresses, {
        fields: [schema_1.orders.id],
        references: [schema_1.shippingAddresses.orderId],
    }),
    reviews: many(schema_1.reviews),
}));
exports.orderItemsRelations = (0, drizzle_orm_1.relations)(schema_1.orderItems, ({ one }) => ({
    order: one(schema_1.orders, { fields: [schema_1.orderItems.orderId], references: [schema_1.orders.id] }),
    product: one(schema_1.products, { fields: [schema_1.orderItems.productId], references: [schema_1.products.id] }),
}));
exports.shippingAddressesRelations = (0, drizzle_orm_1.relations)(schema_1.shippingAddresses, ({ one }) => ({
    order: one(schema_1.orders, { fields: [schema_1.shippingAddresses.orderId], references: [schema_1.orders.id] }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(schema_1.reviews, ({ one, many }) => ({
    user: one(schema_1.users, { fields: [schema_1.reviews.userId], references: [schema_1.users.id] }),
    product: one(schema_1.products, { fields: [schema_1.reviews.productId], references: [schema_1.products.id] }),
    order: one(schema_1.orders, { fields: [schema_1.reviews.orderId], references: [schema_1.orders.id] }),
    helpfulVotes: many(schema_1.reviewHelpfuls),
}));
exports.reviewHelpfulsRelations = (0, drizzle_orm_1.relations)(schema_1.reviewHelpfuls, ({ one }) => ({
    user: one(schema_1.users, { fields: [schema_1.reviewHelpfuls.userId], references: [schema_1.users.id] }),
    review: one(schema_1.reviews, { fields: [schema_1.reviewHelpfuls.reviewId], references: [schema_1.reviews.id] }),
}));
