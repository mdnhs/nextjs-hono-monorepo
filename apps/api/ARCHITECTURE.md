# 🏗️ Multi-Tenant SaaS Ecommerce Architecture

## 📌 Overview

This project is a **multi-tenant SaaS ecommerce platform** where:

- A single application serves multiple independent stores (tenants)
- Each store has:
  - Its own domain or subdomain
  - A dedicated admin panel
  - Fully isolated data

- A central system manages:
  - Users
  - Billing
  - Store lifecycle

---

## 🌐 System Domains

### 1. Main Application (Global Layer)

```
https://yourapp.com
```

Handles:

- Landing page
- Authentication
- Global dashboard
- Billing & subscriptions

---

### 2. Tenant Stores (Store Layer)

```
https://store1.yourapp.com
https://store2.yourapp.com
```

Handles:

- Public storefront
- Store-specific admin panel

---

### 3. Custom Domains (Optional)

```
https://mystore.com → mapped to store1
```

---

## 🧠 Core Request Flow

```
User Request
    ↓
DNS / CDN (Cloudflare)
    ↓
Edge / Server (Next.js + Hono)
    ↓
Middleware (Extract Host)
    ↓
Tenant Identification (Database Lookup)
    ↓
Routing Decision
    ↓
Database Query (tenant-scoped)
    ↓
Response to User
```

---

## 🧩 Application Layers

### 1. Global Layer (User Context)

Accessible via:

```
yourapp.com
```

Features:

- User registration & login
- Multi-store dashboard
- Subscription management
- Billing

---

### 2. Tenant Layer (Store Context)

Accessible via:

```
store1.yourapp.com
```

Features:

- Storefront (customers)
- Store admin panel (owners)

---

## 🔄 User Flows

### 1. Seller Journey

```
Landing Page
    ↓
Sign Up / Login
    ↓
Dashboard
    ↓
Create Store
    ↓
Store Activated
    ↓
Redirect to Store Admin Panel
```

---

### 2. Store Creation Flow

```
Dashboard
    ↓
Create Store
    ↓
Input:
    - Store Name
    - Subdomain or Domain
    - Subscription Plan
    ↓
Save to Database
    ↓
Provision Store
```

---

### 3. Customer Purchase Flow

```
Visit Store
    ↓
Browse Products
    ↓
Add to Cart
    ↓
Checkout
    ↓
Payment Processing
    ↓
Order Created
```

---

## 🧭 Routing Strategy

```ts
const host = req.headers.host

if (host === 'yourapp.com') {
  // Global application (landing, dashboard, auth)
} else {
  const subdomain = host.split('.')[0]
  const store = findStoreBySubdomain(subdomain)

  // Load tenant-specific application
}
```

---

## 🗄️ Database Design (Shared DB, Multi-Tenant)

### Core Tables

#### users

- id
- email
- password

#### stores

- id
- user_id
- name
- subdomain
- custom_domain
- plan

#### products

- id
- store_id
- name
- price

#### orders

- id
- store_id
- total

#### customers

- id
- store_id

---

## 🔑 Multi-Tenancy Strategy

### Approach: Shared Database + `store_id`

All queries must include tenant isolation:

```sql
SELECT * FROM products WHERE store_id = $1;
```

---

## ⚙️ Tech Stack

### Frontend

- Next.js

### Backend

- Hono (API layer)

### Database

- PostgreSQL (Neon recommended)

### Edge / CDN

- Cloudflare

---

## 🔐 Authentication Strategy

### Global Authentication

- Users authenticate via main domain
- Sessions are shared across dashboard and stores (via cookies or JWT)

### Store Admin Access

```
store1.yourapp.com/admin
```

---

## 🧱 Folder Structure (Monorepo)

```
apps/
  web/        # Next.js frontend
  api/        # Hono backend

packages/
  db/         # Database schema & queries (Drizzle ORM)
  ui/         # Shared UI components
  utils/      # Shared utilities
  shared/     # Shared constants and utilities
  types/      # Shared TypeScript types
  eslint-config/  # Shared ESLint configuration
  typescript-config/  # Shared tsconfig presets
```

---

## 🔥 Middleware Responsibilities (Critical)

- Extract host from request
- Identify tenant (store)
- Attach tenant context to request
- Enforce tenant-based access control

---

## 🚀 Deployment Architecture

```
User
  ↓
Cloudflare (CDN + DNS)
  ↓
Edge Runtime
  ↓
Next.js App
  ↓
Hono API
  ↓
PostgreSQL (Neon)
```

---

## 🧠 Scaling Strategy

- Stateless application servers
- CDN caching for static assets
- Database indexing on `store_id`
- Read replicas for scaling (future)
- Queue system for background jobs (optional)

---

## ⚠️ Critical Rules

- ❌ Never mix tenant data
- ❌ Never skip tenant validation
- ✅ Always filter by `store_id`
- ✅ Always verify domain-to-tenant mapping

---

## 🎯 Future Enhancements

- Custom domain support with automatic SSL
- Per-store theme system
- Plugin / extension system
- Role-based access (store staff)
- Advanced analytics dashboard

---

## 🧩 Core Principle

```
HOST → TENANT → DATA ISOLATION
```

If this principle is implemented correctly, the system will be:

- Scalable
- Secure
- Maintainable

---

## ✅ Summary

- Global app manages users, billing, and store creation
- Tenant apps handle store operations
- Subdomain or custom domain determines tenant context
- Data isolation is enforced via `store_id`

---

**End of Architecture**
