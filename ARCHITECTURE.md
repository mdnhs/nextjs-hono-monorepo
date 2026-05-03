# 🏗️ SaaS Architecture Guide

## 📌 High-Level Design

The system follows a **Shared Database, Shared Application** multi-tenant model. Tenant isolation is enforced at the network (Middleware) and application (Query) layers.

---

## 🧠 Tenant Identification Strategy

### 1. Network Layer (Next.js `proxy.ts`)
The `proxy.ts` middleware acts as a traffic router. It extracts the `host` header and:
- **Case A: Custom Domain** (`mystore.com`) → API check for `Store.customDomain` → Rewrite to `/[slug]`.
- **Case B: Subdomain** (`store-a.example.com`) → Extract `store-a` → Rewrite to `/[store-a]`.
- **Case C: Global App** (`example.com`) → No rewrite, serve Landing/Dashboard.

### 2. Application Layer (Hono `resolveTenant`)
The API uses a corresponding middleware to inject the `tenantStore` into the Hono context (`c.get('tenantStore')`), ensuring every controller downstream knows which store it is operating on.

---

## 🔒 Security & Access Control

### Role-Based Access Control (RBAC)
We utilize a dual-layer RBAC system:
1. **Global Roles** (`UserRole`): `ADMIN`, `SELLER`, `BUYER`.
2. **Tenant Roles** (`StoreStaffRole`): `MANAGER`, `EDITOR`, `SUPPORT`.

#### Access Inheritance
- **Sellers** implicitly have full access to stores they **own**.
- **Staff** only have access to stores they are **invited** to, with granular permissions based on their role (e.g., `SUPPORT` cannot change Theme settings).

---

## 🗄️ Database Architecture

### Isolation Mode: Row-Level Isolation
Every tenant-specific table contains a `storeId` foreign key.

```sql
-- Conceptual isolation check
SELECT * FROM products WHERE store_id = :current_tenant_id;
```

### Core Schema Modules
- **Identity**: `User`, `Customer` (Store-specific buyer accounts).
- **Core Shop**: `Store`, `Product`, `ProductVariant`, `Category`.
- **Transactions**: `Order`, `OrderItem`, `Payment`, `Refund`.
- **CMS**: `ThemeSetting`, `Page`, `Navigation`, `NavigationItem`.
- **Inventory**: `Location`, `InventoryLevel`, `InventoryTransaction`.
- **Utility**: `Asset` (R2 mapping), `Webhook`, `IdempotencyKey`.

---

## 📁 Storage (Cloudflare R2)

Multi-tenant asset isolation is handled via path prefixing:
`{BUCKET}/{storeId}/{unique_asset_id}-{filename}`

Storage limits (e.g., 100MB) are enforced by the `AssetService` by summing `sizeBytes` in the DB before allowing new uploads.

---

## 🔄 Core Flows

### 1. Store Creation & Onboarding
1. **Seller** creates a store in the SaaS Dashboard.
2. API creates the **Store** record.
3. API creates an **initial Store Admin** user.
4. API creates a **StoreStaff** record linking them as `MANAGER`.
5. Redirect to Dashboard for multi-store overview.

### 2. Storefront Request
1. Request hits `proxy.ts`.
2. Tenant identified via Host header.
3. Rewritten to `/[storeSlug]`.
4. Page fetches data from Hono via `storeService.getStoreBySlug`.
5. Hono enforces `resolveTenant` and returns store-specific theme, products, and navigation.

---

## 🚀 Scaling & Resilience
- **Database**: Serverless PostgreSQL (Neon) with connection pooling.
- **API**: Hono runs on Node.js, compatible with Edge runtimes (Bun/Cloudflare Workers).
- **Caching**: Tenant lookups are cached in `proxy.ts` (Next.js Cache) and `tenant.ts` (LRU).
- **Idempotency**: Critical for Payments and Order creation to prevent duplicate processing.

---

## 🛡️ Critical Invariants
- ❌ **No Cross-Tenant Queries**: Never select data without `where(eq(t.storeId, currentTenantId))`.
- ❌ **No Global Session Leakage**: Store A customers cannot log into Store B.
- ✅ **Staff Scoping**: Verify `storeStaffs` presence for any staff-level request.
