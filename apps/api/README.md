# E-Commerce Backend API

A multi-tenant e-commerce backend built with Hono.js, Prisma, and PostgreSQL.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Multi-tenant Stores**: Sellers can create and manage their own stores
- **Store Publishing**: Stores can be drafted, published, or suspended
- **Product Management**: Create and manage products within stores
- **Shopping Cart**: Buyers can add products to cart
- **Order Management**: Process and track orders

## Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm package manager

## Setup

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Copy `.env.example` to `.env` and configure your database:
```bash
cp .env.example .env
```

3. Update the DATABASE_URL in `.env` with your PostgreSQL connection string

4. Generate Prisma client and run migrations:
```bash
pnpm prisma generate
pnpm prisma migrate dev
```

5. Start the development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Stores
- `GET /api/stores` - List published stores
- `GET /api/stores/:id` - Get store by ID
- `GET /api/stores/slug/:slug` - Get store by slug
- `POST /api/stores` - Create store (seller only)
- `PATCH /api/stores/:id` - Update store (owner only)
- `DELETE /api/stores/:id` - Delete store (owner only)
- `GET /api/stores/my/stores` - Get current user's stores (seller only)

## User Roles

- **BUYER**: Can browse stores, add to cart, and place orders
- **SELLER**: Can create stores, manage products, and fulfill orders
- **ADMIN**: Full system access

## Development Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm db:studio  # Open Prisma Studio
```