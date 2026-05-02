# E-commerce SaaS Platform

Multi-tenant e-commerce SaaS. SaaS admin manages the platform. Sellers (clients) subscribe to plans, create stores, and sell to buyers (their customers). Each store has its own landing page accessible via subdomain, path, or custom domain.

> 📐 **Detailed architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, request flows, and tenant strategies.

## System Architecture

### System Domains

#### 1. Main Application (Global Layer)
```
https://yourapp.com
```
Handles landing page, authentication, global dashboard, billing & subscriptions.

#### 2. Tenant Stores (Store Layer)
```
https://store1.yourapp.com
https://store2.yourapp.com
```
Handles public storefront and store-specific admin panel.

#### 3. Custom Domains (Optional)
```
https://mystore.com → mapped to store1
```

### Core Request Flow
```
User Request → DNS/CDN (Cloudflare) → Edge/Server (Next.js + Hono)
→ Middleware (Extract Host) → Tenant Identification (DB Lookup)
→ Routing Decision → DB Query (tenant-scoped) → Response
```

### Application Layers

**Global Layer** (`yourapp.com`): User registration, multi-store dashboard, subscription management, billing.

**Tenant Layer** (`store1.yourapp.com`): Storefront for customers, store admin panel for owners.

## User Roles

| Role | Who | Permissions |
|------|-----|-------------|
| **ADMIN** | SaaS admin | Manage plans, approve/reject/suspend stores, view all users & subscriptions, platform dashboard |
| **SELLER** | SaaS clients | Subscribe to plan, create/manage stores, products, orders, reviews |
| **BUYER** | Seller's customers | Browse stores, cart, place orders, write reviews |

## Architecture

### Monorepo Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        Turborepo                             │
├─────────────────────────┬───────────────────────────────────┤
│         apps/           │           packages/               │
│  ┌──────────────────┐   │   ┌────────────────────────────┐  │
│  │  api (Hono)      │   │   │  db (schema & queries)    │  │
│  │  - Node.js server│   │   │  ui (shared components)   │  │
│  │  - Drizzle/Postgres│  │  │  utils (shared utilities) │  │
│  │  - Swagger UI    │   │   │  types (TS definitions)  │  │
│  └──────────────────┘   │   │  eslint-config           │  │
│  ┌──────────────────┐   │   │  typescript-config       │  │
│  │  web (Next.js)   │   │   └────────────────────────────┘  │
│  │  - Next.js App   │   │                                    │
│  │  - API proxy     │   │                                    │
│  └──────────────────┘   │                                    │
└─────────────────────────┴───────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Frontend** | Next.js (App Router), Tailwind CSS |
| **Backend** | Hono (Node.js), TypeScript, Zod |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **API Docs** | Swagger UI (`@hono/swagger-ui`) |
| **Edge/CDN** | Cloudflare |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions |

## Multi-Tenancy Design

### Store Lifecycle

```
Seller Signup → Subscribe to Plan → Create Store (PENDING) → Admin Approves (APPROVED) → Live
                                                           ↓
                                                   Admin Rejects (REJECTED)
                                                           ↓
                                                   Admin Suspends (SUSPENDED)
```

### Domain Setup

When a seller creates a store, they choose a unique `slug` and optionally provide a `customDomain`. After store creation, the seller can update the domain at any time via `PATCH /stores/:id`.

Tenant resolution priority (highest → lowest):

1. **Subdomain** — `mystore.example.com` → resolves slug `mystore` (matched against `APP_DOMAIN` env)
2. **Path-based** — `example.com/store/mystore` → resolves slug from path segment
3. **Custom domain** — `mystore.com` → looked up via `Store.customDomain` field

Only `APPROVED` stores are publicly accessible. Custom domain is a plan feature — available on Pro and Enterprise.

### Subscription & Plans

| Plan | Monthly | Stores | Products | Orders | Storage | Key Features |
|------|---------|--------|----------|--------|---------|--------------|
| Starter | Free | 1 | 50 | 100 | 100MB | Basic analytics, email support, 14-day trial |
| Basic | $9.99 | 1 | 200 | 500 | 500MB | + Analytics, custom email |
| Pro | $29.99 | 3 | 1000 | Unlimited | 2GB | + Custom domain, API access, remove branding |
| Enterprise | $99.99 | Unlimited | Unlimited | Unlimited | 10GB | + Priority support, white-label, dedicated support |

## Project Structure

```
├── apps/
│   ├── api/                      # Backend (Hono + Node.js)
│   │   ├── drizzle.config.ts     # Drizzle ORM config
│   │   └── src/
│   │       ├── db/
│   │       │   ├── schema.ts     # Database schema (Drizzle)
│   │       │   ├── relations.ts  # Table relations
│   │       │   ├── seed.ts       # Seed data (plans, test accounts)
│   │       │   └── index.ts      # DB client
│   │       ├── controllers/      # Request handlers
│   │       │   ├── admin.controller.ts    # Platform dashboard, store management
│   │       │   ├── auth.controller.ts     # Login, register, profile
│   │       │   ├── cart.controller.ts     # Cart operations
│   │       │   ├── order.controller.ts    # Order management
│   │       │   ├── plan.controller.ts     # Plan CRUD (admin)
│   │       │   ├── product.controller.ts  # Product CRUD
│   │       │   ├── review.controller.ts   # Review CRUD
│   │       │   └── store.controller.ts    # Store CRUD, domain, subscriptions
│   │       ├── middlewares/
│   │       │   ├── auth.ts       # JWT authentication + RBAC
│   │       │   ├── limits.ts     # Plan limit enforcement
│   │       │   └── tenant.ts     # Tenant resolution (subdomain/path/custom domain)
│   │       ├── routes/
│   │       │   ├── admin.ts      # /api/v1/admin/*
│   │       │   ├── auth.ts       # /api/v1/auth/*
│   │       │   ├── plans.ts      # /api/v1/plans/*
│   │       │   └── ...           # Other route modules
│   │       ├── services/         # Business logic layer
│   │       └── utils/
│   │           ├── openapi-generator.ts  # Swagger/OpenAPI spec
│   │           └── auth.ts       # JWT, password hashing
│   │
│   └── web/                      # Frontend (Next.js)
│       └── src/
│           ├── app/              # Next.js App Router
│           ├── components/       # UI components
│           ├── contexts/         # React contexts (Theme, Query, etc.)
│           └── lib/             # Utilities, fonts, helpers
│
├── packages/
│   ├── db/                       # Database schema & queries
│   ├── ui/                       # Shared UI components
│   ├── utils/                    # Shared utilities
│   ├── types/                    # Shared TypeScript types
│   ├── eslint-config/            # Shared ESLint configuration
│   └── typescript-config/        # Shared tsconfig presets
│
├── .github/workflows/            # CI/CD pipelines
├── turbo.json                    # Turborepo configuration
└── pnpm-workspace.yaml           # Workspace definition
```

## API Endpoints

All endpoints versioned under `/api/v1/`.

| Module | Routes | Auth |
|--------|--------|------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/profile` | Mixed |
| **Plans** | `GET /plans` (public), `GET /plans/all`, `POST /plans`, `PATCH /plans/:id`, `DELETE /plans/:id` | Admin |
| **Stores** | `GET /stores`, `GET /stores/my`, `POST /stores`, `PATCH /stores/:id`, `DELETE /stores/:id`, `GET /stores/:id/subscription`, `POST /stores/:id/subscription/cancel`, `POST /stores/:id/subscription/upgrade`, `GET /stores/:id/limits` | Mixed |
| **Products** | `GET /products`, `GET /products/my`, `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id`, `PATCH /products/:id/inventory` | Mixed |
| **Cart** | `GET /cart`, `POST /cart`, `PATCH /cart/:productId`, `DELETE /cart/:productId`, `DELETE /cart/clear` | Buyer |
| **Orders** | `POST /orders`, `GET /orders`, `GET /orders/all`, `GET /orders/:id`, `PATCH /orders/:id/status`, `GET /orders/seller` | Mixed |
| **Reviews** | `POST /reviews/:productId`, `PATCH /reviews/:id`, `DELETE /reviews/:id`, `GET /reviews/product/:productId` | Mixed |
| **Categories** | `GET /categories`, `GET /categories/:slug` | None |
| **Admin** | `GET /admin/dashboard`, `GET /admin/stores`, `GET /admin/stores/pending`, `POST /admin/stores/:id/approve`, `POST /admin/stores/:id/reject`, `POST /admin/stores/:id/suspend`, `GET /admin/users`, `GET /admin/users/:id`, `GET /admin/subscriptions` | Admin |

**Swagger UI**: `GET /swagger/ui`  
**OpenAPI JSON**: `GET /swagger/doc`

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9.15
- PostgreSQL database (Neon recommended)

### Environment Variables

**`apps/api/.env`**
```
DATABASE_URL="postgresql://user:pass@host/db"
JWT_SECRET="your-strong-secret-key"
PORT=4000
NODE_ENV=development
APP_DOMAIN=example.com
```

**`apps/web/.env`**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Installation

```bash
pnpm install

cd apps/api
pnpm db:generate    # Generate Drizzle types
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed plans and test accounts

pnpm dev            # Start all apps
pnpm dev:api        # API only
pnpm dev:web        # Web only
```

### Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| Seller | `seller@example.com` | `seller123` |
| Buyer | `buyer@example.com` | `buyer123` |

### Key Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format with Prettier |
| `pnpm dev:api` | API server only |
| `pnpm dev:web` | Web app only |
| `pnpm db:generate` | Generate Drizzle client |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema to DB |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed test data |

## Development Conventions

- **Routes**: `src/routes/*.ts`, mounted in `src/index.ts`
- **Controllers**: Handle requests, delegate to services
- **Services**: Business logic + DB operations
- **Middleware**: Auth (`auth.ts`), tenant resolution (`tenant.ts`), limit enforcement (`limits.ts`)
- **Validation**: Zod schemas in `src/utils/validation.ts`
- **Error handling**: `HTTPException` from `hono/http-exception`
- **DB**: Drizzle ORM with `src/db/schema.ts` — no Prisma

## API Documentation

Swagger UI at `http://localhost:4000/swagger/ui`. OpenAPI spec auto-generated from `src/utils/openapi-generator.ts`.

To add endpoint to docs, append entry to `routes` array in `openapi-generator.ts`:

```typescript
{
  path: '/api/v1/your/endpoint',
  method: 'post',
  tags: ['YourModule'],
  summary: 'Endpoint description',
  requiresAuth: true,
  params: { id: { type: 'string', description: 'ID' } },
  query: { page: { type: 'integer', description: 'Page number' } },
  requestBody: { field: { type: 'string' } },
  responses: { '200': { description: 'Success' } },
},
```
