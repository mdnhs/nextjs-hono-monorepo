"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.mockInsertReturning = mockInsertReturning;
exports.mockUpdateReturning = mockUpdateReturning;
exports.mockSelectFrom = mockSelectFrom;
const vitest_1 = require("vitest");
const makeQueryTable = () => ({
    findFirst: vitest_1.vi.fn(),
    findMany: vitest_1.vi.fn(),
});
exports.db = {
    query: {
        users: makeQueryTable(),
        stores: makeQueryTable(),
        products: makeQueryTable(),
        categories: makeQueryTable(),
        reviews: makeQueryTable(),
        reviewHelpfuls: makeQueryTable(),
        carts: makeQueryTable(),
        cartItems: makeQueryTable(),
        orders: makeQueryTable(),
        orderItems: makeQueryTable(),
        plans: makeQueryTable(),
        subscriptions: makeQueryTable(),
        shippingAddresses: makeQueryTable(),
    },
    insert: vitest_1.vi.fn(),
    update: vitest_1.vi.fn(),
    delete: vitest_1.vi.fn(),
    select: vitest_1.vi.fn(),
    transaction: vitest_1.vi.fn(),
};
// Helper to chain insert/update/delete fluent API in tests
function mockInsertReturning(result) {
    const returning = vitest_1.vi.fn().mockResolvedValue(result);
    const values = vitest_1.vi.fn().mockReturnValue({ returning });
    exports.db.insert.mockReturnValue({ values });
    return { values, returning };
}
function mockUpdateReturning(result) {
    const returning = vitest_1.vi.fn().mockResolvedValue(result);
    const where = vitest_1.vi.fn().mockReturnValue({ returning });
    const set = vitest_1.vi.fn().mockReturnValue({ where });
    exports.db.update.mockReturnValue({ set });
    return { set, where, returning };
}
function mockSelectFrom(result) {
    const where = vitest_1.vi.fn().mockResolvedValue(result);
    const from = vitest_1.vi.fn().mockReturnValue({ where });
    exports.db.select.mockReturnValue({ from });
    return { from, where };
}
