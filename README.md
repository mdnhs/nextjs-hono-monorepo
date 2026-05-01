# E-commerce SaaS Platform

A multi-tenant e-commerce SaaS platform built with a Turborepo monorepo. Sellers can create subscription-based stores with isolated data, and admins manage pricing plans, store approvals, and subscriptions.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Turborepo                             │
├─────────────────────────┬───────────────────────────────────┤
│         apps/           │           packages/               │
│  ┌──────────────────┐   │   ┌────────────────────────────┐  │
│  │  api (Hono)      │   │   │  shared (shared utilities) │  │
│  │  - Node.js server│   │   │  types (TS type definitions)│  │
│  │  - Prisma/Postgres│   │  │  eslint-config             │  │
│  │  - Swagger UI    │   │   │  typescript-config          │  │
│  └──────────────────┘   │   └────────────────────────────┘  │
│  ┌──────────────────┐   │                                    │
│  │  web (Next.js)   │   │                                    │
│  │  - Next.js App   │   │                                    │
│  │  - API proxy     │   │                                    │
│  └──────────────────┘   │                                    │
└─────────────────────────┴───────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Backend** | Hono (Node.js), TypeScript, Zod |
| **Frontend** | Next.js (App Router), Tailwind CSS |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **API Docs** | Swagger UI (`@hono/swagger-ui`) |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions |

## Multi-Tenancy Design

### Tenant Resolution
Tenants are resolved via three methods (priority order):
1. **Subdomain**: `mystore.example.com` → resolves to `mystore`
2. **Path-based**: `example.com/store/:slug` → resolves to `:slug`
3. **Custom Domain**: `mystore.com` → resolved via `Store.customDomain`

Each store is data-isolated:
- Products, orders, and cart items belong to a specific `Store`
- Middleware (`src/middlewares/tenant.ts`) resolves and validates tenant context
- Only `APPROVED` stores are publicly accessible

### Store Lifecycle

```
Seller Signup → Create Store (PENDING) → Admin Approves (APPROVED) → Live
                                      ↓
                              Admin Rejects (REJECTED)
                                      ↓
                              Admin Suspends (SUSPENDED)
```

### Subscription & Plans

| Plan | Monthly | Stores | Products | Orders | Storage | Features |
|------|---------|--------|----------|--------|---------|----------|
| Starter | Free | 1 | 50 | 100 | 100MB | Basic analytics, email support, 14-day trial |
| Basic | $9.99 | 1 | 200 | 500 | 500MB | + Analytics, custom email |
| Pro | $29.99 | 3 | 1000 | Unlimited | 2GB | + Custom domain, API access, remove branding |
| Enterprise | $99.99 | Unlimited | Unlimited | Unlimited | 10GB | + Priority support, white-label, dedicated support |

Plan limits are enforced via middleware (`src/middlewares/limits.ts`).

## Project Structure

```
├── apps/
│   ├── api/                      # Backend (Hono + Node.js)
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   ├── migrations/       # Prisma migrations
│   │   │   └── seed.ts           # Seed data (plans, test accounts)
│   │   └── src/
│   │       ├── controllers/      # Request handlers
│   │       │   ├── admin.controller.ts    # Admin dashboard, store management
│   │       │   ├── auth.controller.ts     # Login, register, profile
│   │       │   ├── cart.controller.ts     # Cart operations
│   │       │   ├── order.controller.ts    # Order management
│   │       │   ├── plan.controller.ts     # Plan CRUD (admin)
│   │       │   ├── product.controller.ts  # Product CRUD
│   │       │   ├── review.controller.ts   # Review CRUD
│   │       │   └── store.controller.ts    # Store CRUD, subscriptions
│   │       ├── middlewares/
│   │       │   ├── auth.ts       # JWT authentication + RBAC
│   │       │   ├── limits.ts     # Plan limit enforcement
│   │       │   └── tenant.ts     # Tenant resolution
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
│       └── src/app/api/          # API proxy routes
│
├── packages/
│   ├── shared/                   # Shared utilities and constants
│   ├── types/                    # Shared TypeScript types
│   ├── eslint-config/            # Shared ESLint configuration
│   └── typescript-config/        # Shared tsconfig presets
│
├── .github/workflows/            # CI/CD pipelines
├── turbo.json                    # Turborepo configuration
└── pnpm-workspace.yaml           # Workspace definition
```

## API Endpoints

All endpoints are versioned under `/api/v1/`.

| Module | Routes | Auth Required |
|--------|--------|---------------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/profile` | Mixed |
| **Plans** | `GET /plans` (public), `GET /plans/all`, `POST /plans`, `PATCH /plans/:id`, `DELETE /plans/:id` | Admin |
| **Stores** | `GET /stores`, `GET /stores/my`, `POST /stores`, `PATCH /stores/:id`, `DELETE /stores/:id`, `GET /stores/:id/subscription`, `POST /stores/:id/subscription/cancel`, `POST /stores/:id/subscription/upgrade`, `GET /stores/:id/limits` | Mixed |
| **Products** | `GET /products`, `GET /products/my`, `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id`, `PATCH /products/:id/inventory` | Mixed |
| **Cart** | `GET /cart`, `POST /cart`, `PATCH /cart/:productId`, `DELETE /cart/:productId`, `DELETE /cart/clear` | Seller |
| **Orders** | `POST /orders`, `GET /orders`, `GET /orders/all`, `GET /orders/:id`, `PATCH /orders/:id/status`, `GET /orders/seller` | Seller |
| **Reviews** | `POST /reviews/:productId`, `PATCH /reviews/:id`, `DELETE /reviews/:id`, `GET /reviews/product/:productId` | Mixed |
| **Categories** | `GET /categories`, `GET /categories/:slug` | None |
| **Admin** | `GET /admin/dashboard`, `GET /admin/stores`, `GET /admin/stores/pending`, `POST /admin/stores/:id/approve`, `POST /admin/stores/:id/reject`, `POST /admin/stores/:id/suspend`, `GET /admin/users`, `GET /admin/users/:id`, `GET /admin/subscriptions` | Admin |

**Swagger UI**: `GET /swagger/ui`
**OpenAPI JSON**: `GET /swagger/doc`

## Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full platform access: manage plans, approve/reject stores, view all users, subscriptions, dashboard stats |
| **SELLER** | Create/manage stores, products, orders, cart, reviews. Default role on signup |
| **BUYER** | Browse approved stores, add to cart, place orders, write reviews |

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
# Install dependencies
pnpm install

# Set up database
cd apps/api
pnpm db:generate    # Generate Prisma Client
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed with plans and test accounts

# Run the dev server
pnpm dev            # Start both api and web
pnpm dev:api        # Start API only
pnpm dev:web        # Start web only
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
| `pnpm format` | Format code with Prettier |
| `pnpm dev:api` | Start API server only |
| `pnpm dev:web` | Start web app only |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database with test data |

## Development Conventions

- **Routes**: Defined in `src/routes/*.ts`, mounted in `src/index.ts`
- **Controllers**: Handle requests, delegate to services
- **Services**: Business logic, database operations
- **Middleware**: Authentication (`auth.ts`), tenant resolution (`tenant.ts`), limit enforcement (`limits.ts`)
- **Validation**: Zod schemas in `src/utils/validation.ts`
- **Error handling**: `HTTPException` from `hono/http-exception`

## API Documentation

Swagger UI is available at `http://localhost:4000/swagger/ui` when the API server is running. The OpenAPI spec auto-regenerates from `src/utils/openapi-generator.ts`.

To add a new endpoint to the docs, add an entry to the `routes` array in `openapi-generator.ts`:

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
