# 🏗️ SaaS Architecture Guide

## 📌 High-Level Design

The system follows a **Shared Database, Shared Application** multi-tenant model. Tenant isolation is enforced at the network (Middleware) and application (Query) layers.

---

## 🧠 Tenant Identification Strategy

### 1. Network Layer (Next.js `src/proxy.ts`)

The `proxy.ts` middleware acts as a traffic router. It extracts the `host` header and:

- **Case A: Custom Domain** (`mystore.com`) → API check for `Store.customDomain` → Rewrite to `/[slug]`.
- **Case B: Subdomain** (`store-a.example.com`) → Extract `store-a` → Rewrite to `/[store-a]`.
- **Case C: Global App** (`example.com`) → No rewrite, serve Landing/Dashboard.

_Performance_: Custom domain lookups are cached in-memory with a TTL and protected by an in-flight request deduplicator (Stampede guard) to minimize API latency.

### 2. Application Layer (Hono `resolveTenant`)

The API uses a corresponding middleware to inject the `tenantStore` into the Hono context (`c.get('tenantStore')`). It handles:

- Host-based resolution for custom domains.
- Subdomain-based resolution for standard platform URLs.
- Path-based resolution (`/store/:slug/...`) for development and debugging.

---

## 🌐 Custom Domain Verification

The platform provides a self-service domain verification flow:

1. **TXT Verification**: Seller adds a `_saas-verify` TXT record with a generated token.
2. **DNS Check**: `DomainService` uses `node:dns/promises` to verify the record.
3. **Binding**: Once verified, the domain is bound to the store and the tenant cache is invalidated.
4. **SSL/TLS**: Integrated with Caddy's "On-Demand TLS" to automatically issue certificates for verified custom domains.

---

## 🔒 Security & Access Control

### Role-Based Access Control (RBAC)

We utilize a dual-layer RBAC system:

1. **Global Roles** (`UserRole`): `ADMIN` (Platform), `SELLER` (Multi-store owner), `BUYER` (Customer).
2. **Tenant Roles** (`StoreStaffRole`): `MANAGER`, `EDITOR`, `SUPPORT`.

#### Access Inheritance

- **Sellers** implicitly have full access to stores they **own**.
- **Staff** only have access to stores they are **invited** to, with granular permissions enforced via `requireStoreAccess` middleware.

---

## 🛠 Service Layer Pattern

Business logic is encapsulated in a dedicated `services/` layer in the API:

- **BaseService**: Provides common DB operations and pattern consistency.
- **Transaction Safety**: Complex operations (like Order creation or Domain binding) use Drizzle transactions to ensure atomic updates.
- **Validation**: Strict Zod validation at both the Route and Service levels.

---

## ⚙️ Asynchronous Processing (BullMQ)

Critical but slow operations are offloaded to background workers:

- **Architecture**: A separate worker process (`src/queue/worker.ts`) consumes jobs from Redis.
- **Retry Logic**: Automatic exponential backoff for failed jobs (e.g., webhook delivery).
- **Scheduled Tasks**: Repeatable jobs for system maintenance (abandoned cart notifications, subscription expiry).

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
- **Transactions**: `Order`, `OrderItem`, `Payment`, `Refund`, `IdempotencyKey`.
- **CMS**: `ThemeSetting`, `Page`, `Navigation`, `NavigationItem`.
- **Inventory**: `Location`, `InventoryLevel`, `InventoryTransaction`.
- **Utility**: `Asset` (R2 mapping), `Webhook`, `DomainVerification`.

---

## 📁 Storage (Cloudflare R2)

Multi-tenant asset isolation is handled via path prefixing:
`{BUCKET}/{storeId}/{unique_asset_id}-{filename}`

Storage limits (e.g., 100MB) are enforced by the `AssetService` and `enforceStorageLimit` middleware by summing `sizeBytes` in the DB before allowing new uploads.

---

## 🔄 Core Flows

### 1. Store Creation & Onboarding

1. **Seller** creates a store in the SaaS Dashboard.
2. API creates the **Store** record.
3. API creates an **initial Store Admin** user.
4. API creates a **StoreStaff** record linking them as `MANAGER`.
5. Redirect to Dashboard for multi-store overview.

### 2. Storefront Request

1. Request hits `src/proxy.ts` (Next.js Middleware).
2. Tenant identified via Host header or Subdomain.
3. Rewritten to `/[storeSlug]`.
4. Page fetches data from Hono via `storeService.getStoreBySlug`.
5. Hono enforces `resolveTenant` and returns store-specific theme, products, and navigation.

---

## 🌍 Internationalization (i18n)

The web application uses `next-intl` for a localized experience:

- **Landing & Dashboard**: Standard locale-based routing.
- **Storefronts**: Dynamic locale detection based on store settings and customer preferences.
- **Shared Translations**: Located in `packages/shared/i18n`.

---

## 🚀 Scaling & Resilience

- **Database**: Serverless PostgreSQL (Neon) with connection pooling.
- **API**: Hono runs on Node.js, compatible with Edge runtimes.
- **Caching**: Multi-layer caching (Redis for DB queries, In-memory for Tenant resolution).
- **Idempotency**: `IdempotencyKey` table and middleware prevent duplicate processing for Payments and Order creation.

---

## 🛡️ Critical Invariants

- ❌ **No Cross-Tenant Queries**: Never select data without `where(eq(t.storeId, currentTenantId))`.
- ❌ **No Global Session Leakage**: Store A customers cannot log into Store B.
- ✅ **Staff Scoping**: Verify `storeStaffs` presence for any staff-level request.
