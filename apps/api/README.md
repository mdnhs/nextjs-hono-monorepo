# E-Commerce Backend API

Multi-tenant e-commerce backend. Hono.js + Drizzle ORM + PostgreSQL.

## Roles

| Role | Description |
|------|-------------|
| **ADMIN** | SaaS platform admin — manages plans, approves/rejects stores, views all data |
| **SELLER** | SaaS client — subscribes to plan, creates stores, manages products/orders |
| **BUYER** | Seller's customer — browses stores, adds to cart, places orders, writes reviews |

## Store & Domain Flow

1. Seller registers → role defaults to `SELLER`
2. Seller subscribes to a plan
3. Seller creates store with a unique `slug` and optional `customDomain` → status `PENDING`
4. Admin approves store → status `APPROVED` → store goes live
5. Seller can update `customDomain` anytime via `PATCH /stores/:id` (requires Pro/Enterprise plan)

Tenant resolved per-request by `src/middlewares/tenant.ts`:
- Subdomain: `{slug}.{APP_DOMAIN}` 
- Path: `/store/{slug}`
- Custom domain: exact match on `Store.customDomain`

Only `APPROVED` stores serve public traffic.

## Prerequisites

- Node.js 20+
- PostgreSQL
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, APP_DOMAIN

pnpm db:generate   # Generate Drizzle types
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed plans + test accounts
pnpm dev           # Start dev server on :4000
```

## Environment Variables

```
DATABASE_URL="postgresql://user:pass@host/db"
JWT_SECRET="your-strong-secret-key"
PORT=4000
NODE_ENV=development
APP_DOMAIN=example.com
```

## API Endpoints

All routes under `/api/v1/`.

### Auth
- `POST /auth/register` — Register (defaults to SELLER)
- `POST /auth/login` — Login, returns JWT
- `POST /auth/logout` — Logout
- `GET /auth/profile` — Get current user

### Plans (Admin)
- `GET /plans` — List active plans (public)
- `GET /plans/all` — List all plans including hidden (admin)
- `POST /plans` — Create plan
- `PATCH /plans/:id` — Update plan
- `DELETE /plans/:id` — Delete plan

### Stores (Seller)
- `GET /stores` — List approved stores
- `GET /stores/my` — Seller's own stores
- `POST /stores` — Create store (requires `planId`, optional `customDomain`)
- `PATCH /stores/:id` — Update store info or domain
- `DELETE /stores/:id` — Delete store
- `GET /stores/:id/subscription` — Get subscription details
- `POST /stores/:id/subscription/cancel` — Cancel subscription
- `POST /stores/:id/subscription/upgrade` — Upgrade plan
- `GET /stores/:id/limits` — Check plan limits (products/orders)

### Products
- `GET /products` — List products (tenant-scoped)
- `GET /products/my` — Seller's products
- `GET /products/:id` — Get product
- `POST /products` — Create product
- `PATCH /products/:id` — Update product
- `DELETE /products/:id` — Delete product
- `PATCH /products/:id/inventory` — Update stock

### Cart (Buyer)
- `GET /cart` — Get cart
- `POST /cart` — Add item
- `PATCH /cart/:productId` — Update quantity
- `DELETE /cart/:productId` — Remove item
- `DELETE /cart/clear` — Clear cart

### Orders
- `POST /orders` — Place order
- `GET /orders` — Buyer's orders
- `GET /orders/seller` — Seller's incoming orders
- `GET /orders/all` — All orders (admin)
- `GET /orders/:id` — Order detail
- `PATCH /orders/:id/status` — Update order status

### Reviews
- `POST /reviews/:productId` — Add review
- `PATCH /reviews/:id` — Edit review
- `DELETE /reviews/:id` — Delete review
- `GET /reviews/product/:productId` — Product reviews

### Categories
- `GET /categories` — List categories
- `GET /categories/:slug` — Category by slug

### Admin
- `GET /admin/dashboard` — Platform stats
- `GET /admin/stores` — All stores
- `GET /admin/stores/pending` — Pending approval
- `POST /admin/stores/:id/approve` — Approve store
- `POST /admin/stores/:id/reject` — Reject store
- `POST /admin/stores/:id/suspend` — Suspend store
- `GET /admin/users` — All users
- `GET /admin/users/:id` — User detail
- `GET /admin/subscriptions` — All subscriptions

**Swagger UI**: `http://localhost:4000/swagger/ui`

## Development Scripts

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Start production
pnpm typecheck    # Type check
pnpm lint         # Lint
pnpm db:generate  # Drizzle generate
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema
pnpm db:studio    # Drizzle Studio
pnpm db:seed      # Seed data
pnpm test         # Run tests
```

## Test Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| Seller | `seller@example.com` | `seller123` |
| Buyer | `buyer@example.com` | `buyer123` |
