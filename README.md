# E-commerce SaaS Platform (Shopify-like)

A professional multi-tenant e-commerce SaaS built with **Next.js 16** and **Hono**. SaaS admin manages the platform, while Sellers (clients) create and manage multiple stores. Each store is a complete tenant with its own Storefront, Admin Panel, and isolated data.

> 📐 **Detailed architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, request flows, and tenant strategies.

## 🚀 System Architecture

### 1. SaaS Dashboard (Global Layer)
`https://yourapp.com`
- User onboarding & registration.
- **Multi-store management**: Sellers can create and track multiple shops.
- Subscription billing & plan management.

### 2. Tenant Storefront & Admin (Store Layer)
`https://{slug}.yourapp.com` or `https://customdomain.com`
- **Storefront**: High-performance shopping experience for customers.
- **Store Admin**: Dedicated panel for products, orders, and staff.
- **CMS**: Custom themes, pages, and navigation menus.

## ✨ Key Features

- 🏢 **Multi-tenancy**: Full isolation via host-based middleware and DB row-level security.
- 🌐 **Custom Domains**: Automatic routing for third-party domains (e.g., `mystore.com`).
- 👥 **Store Staff (RBAC)**: Invite employees with roles: `MANAGER`, `EDITOR`, `SUPPORT`.
- 🎨 **Storefront CMS**: Dynamic theme customization (colors/fonts), custom pages, and menus.
- 📁 **R2 Asset Management**: Multi-tenant media gallery with storage limits per plan.
- 💳 **Payments**: Integrated with Stripe (Global) and SSLCommerz.
- ⚡ **Performance**: Next.js 16 (Turbopack) + Hono RPC for end-to-end type safety.

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS, TanStack Query |
| **Backend** | Hono (Node.js), TypeScript, Zod |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **Storage** | Cloudflare R2 |
| **Cache & Queue** | Redis (Upstash/Self-hosted) + BullMQ |
| **I18n** | next-intl |
| **Validation** | Zod (Shared schemas) |
| **Styling** | Shadcn UI + Lucide Icons |

## 🏗 Project Structure

```
├── apps/
│   ├── api/                      # Backend (Hono + Node.js)
│   │   ├── src/
│   │   │   ├── middlewares/      # Tenant resolution, RBAC, Idempotency
│   │   │   ├── routes/           # CMS, Staff, Assets, Stores, Products...
│   │   │   ├── services/         # Business logic & DB transactions
│   │   │   └── queue/            # BullMQ workers & schedulers
│   └── web/                      # Frontend (Next.js 16)
│       ├── src/
│       │   ├── proxy.ts          # Custom domain & Subdomain middleware
│       │   ├── features/         # Modular feature folders (Auth, CMS, Admin)
│       │   └── services/         # API Client & Service layer
├── packages/
│   ├── shared/                   # Shared Zod schemas & utility functions
│   ├── types/                    # Shared TypeScript interfaces & DTOs
│   ├── ui/                       # Shared UI components (Shadcn-based)
│   ├── db/                       # Shared DB client & schema definitions
│   └── typescript-config/        # Shared TS configuration
```

## ⚙️ Asynchronous Processing

The platform uses **BullMQ** to handle background tasks, ensuring the API remains responsive.
- 📧 **Emails**: Transactional emails for orders, invites, and password resets.
- 🔗 **Webhooks**: Notifying external systems of store events (e.g., `ORDER_CREATED`).
- 🔍 **Search Indexing**: Real-time product indexing for storefront search.
- 🧹 **Cleanup**: Periodic tasks for expiring subscriptions and abandoned carts.

## 🚥 Tenant Resolution Priority

The `proxy.ts` (Next.js 16 middleware) determines the tenant context in this order:
1. **Host Header**: Exact match for `customDomain` in DB (Cached in-memory).
2. **Subdomain**: `*.example.com` → maps to `Store.slug`.
3. **Internal Rewrite**: Next.js rewrites the request to `/[storeSlug]/...` internally.

## 🏁 Getting Started

### Installation
```bash
pnpm install
```

### DB Setup
```bash
cd apps/api
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Apply to Neon
pnpm db:seed        # Seed plans & admin
```

### Start Development
```bash
# Start all apps (Web + API + Workers)
pnpm dev

# Start specific apps
pnpm dev:web
pnpm dev:api
```

## 🔒 User Roles

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| **ADMIN** | Platform | Manage Plans, Moderate Stores, Platform Analytics |
| **SELLER** | Multi-Store | Create Stores, Manage own shops, Billing |
| **MANAGER** | Single Store | Full access to one store (products, orders, staff) |
| **EDITOR** | Single Store | CMS, Pages, Product content |
| **SUPPORT** | Single Store | View orders, Handle customer tickets |
| **BUYER** | Single Store | Shopping, Cart, Reviews |
