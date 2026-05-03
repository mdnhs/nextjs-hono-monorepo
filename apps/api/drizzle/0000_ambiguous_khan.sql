-- Step 1: variants, customers, money/currency, soft delete.
-- Hand-crafted incremental migration. Existing tables already created by prior Prisma migrations.
-- Snapshot reflects target schema; this SQL is the incremental diff applied to a Prisma-bootstrapped DB.

-- ============================================================
-- Customer (per-store buyer accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" text PRIMARY KEY NOT NULL,
  "storeId" text NOT NULL,
  "email" text NOT NULL,
  "passwordHash" text,
  "name" text,
  "phone" text,
  "emailVerifiedAt" timestamp,
  "acceptsMarketing" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp,
  CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_storeId_email_key" ON "Customer" ("storeId", "email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Customer_storeId_idx" ON "Customer" ("storeId");
--> statement-breakpoint

-- ============================================================
-- ProductVariant (SKU-level entity, default variant per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" text PRIMARY KEY NOT NULL,
  "productId" text NOT NULL,
  "sku" text NOT NULL,
  "name" text,
  "options" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "priceCents" bigint NOT NULL,
  "compareAtPriceCents" bigint,
  "currency" text DEFAULT 'USD' NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "quantity" integer DEFAULT 0 NOT NULL,
  "weightGrams" integer,
  "barcode" text,
  "isDefault" boolean DEFAULT false NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp,
  CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_sku_key" ON "ProductVariant" ("sku");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant" ("productId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProductVariant_isDefault_idx" ON "ProductVariant" ("isDefault");
--> statement-breakpoint

-- ============================================================
-- Money/currency canonical columns (cents) + soft delete on existing tables
-- ============================================================
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD' NOT NULL;
--> statement-breakpoint
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
--> statement-breakpoint

ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "priceMonthlyCents" bigint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "priceYearlyCents" bigint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD' NOT NULL;
--> statement-breakpoint
UPDATE "Plan" SET
  "priceMonthlyCents" = ROUND(COALESCE("priceMonthly", 0) * 100)::bigint,
  "priceYearlyCents" = ROUND(COALESCE("priceYearly", 0) * 100)::bigint;
--> statement-breakpoint

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceCents" bigint;
--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "currency" text;
--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
--> statement-breakpoint
UPDATE "Product" SET
  "priceCents" = ROUND(COALESCE("price", 0) * 100)::bigint,
  "currency" = 'USD'
WHERE "priceCents" IS NULL;
--> statement-breakpoint

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "totalCents" bigint;
--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD' NOT NULL;
--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
--> statement-breakpoint
UPDATE "Order" SET "totalCents" = ROUND(COALESCE("total", 0) * 100)::bigint WHERE "totalCents" IS NULL;
--> statement-breakpoint

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "priceCents" bigint;
--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "currency" text;
--> statement-breakpoint
UPDATE "OrderItem" SET
  "priceCents" = ROUND(COALESCE("price", 0) * 100)::bigint,
  "currency" = 'USD'
WHERE "priceCents" IS NULL;
--> statement-breakpoint

-- ============================================================
-- Variant linkage on cart/order items
-- ============================================================
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "variantId" text;
--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "variantId" text;
--> statement-breakpoint

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
--> statement-breakpoint
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
--> statement-breakpoint

-- ============================================================
-- Backfill: default variant per existing product
-- ============================================================
INSERT INTO "ProductVariant" (
  "id", "productId", "sku", "options", "priceCents", "currency", "price", "quantity", "isDefault", "position", "createdAt", "updatedAt"
)
SELECT
  'var_' || p."id",
  p."id",
  p."sku",
  '{}'::jsonb,
  COALESCE(p."priceCents", ROUND(COALESCE(p."price", 0) * 100)::bigint),
  COALESCE(p."currency", 'USD'),
  p."price",
  p."quantity",
  true,
  0,
  p."createdAt",
  p."updatedAt"
FROM "Product" p
WHERE NOT EXISTS (
  SELECT 1 FROM "ProductVariant" v WHERE v."productId" = p."id" AND v."isDefault" = true
);
--> statement-breakpoint

-- ============================================================
-- Variant FKs on cart/order items + indexes
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CartItem_variantId_fkey') THEN
    ALTER TABLE "CartItem"
      ADD CONSTRAINT "CartItem_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_variantId_fkey') THEN
    ALTER TABLE "OrderItem"
      ADD CONSTRAINT "OrderItem_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "CartItem_variantId_idx" ON "CartItem" ("variantId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem" ("variantId");
--> statement-breakpoint

-- ============================================================
-- Payment provider tables (Step 3)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM('PENDING','AUTHORIZED','CAPTURED','FAILED','CANCELLED','REFUNDED','PARTIALLY_REFUNDED');
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentProvider') THEN
    CREATE TYPE "PaymentProvider" AS ENUM('STRIPE','SSLCOMMERZ','MANUAL');
  END IF;
END $$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" text PRIMARY KEY NOT NULL,
  "orderId" text NOT NULL,
  "storeId" text NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "providerRef" text,
  "status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
  "amountCents" bigint NOT NULL,
  "currency" text NOT NULL,
  "providerData" jsonb,
  "errorMessage" text,
  "authorizedAt" timestamp,
  "capturedAt" timestamp,
  "failedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  CONSTRAINT "Payment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment" ("orderId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Payment_storeId_idx" ON "Payment" ("storeId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Payment_providerRef_idx" ON "Payment" ("providerRef");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "Refund" (
  "id" text PRIMARY KEY NOT NULL,
  "paymentId" text NOT NULL,
  "providerRef" text,
  "amountCents" bigint NOT NULL,
  "currency" text NOT NULL,
  "reason" text,
  "providerData" jsonb,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Refund_paymentId_idx" ON "Refund" ("paymentId");
--> statement-breakpoint

-- ============================================================
-- Idempotency keys (Step 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS "IdempotencyKey" (
  "id" text PRIMARY KEY NOT NULL,
  "scope" text NOT NULL,
  "key" text NOT NULL,
  "requestHash" text NOT NULL,
  "responseStatus" integer,
  "responseBody" jsonb,
  "lockedAt" timestamp,
  "completedAt" timestamp,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "IdempotencyKey_scope_key_uq" ON "IdempotencyKey" ("scope", "key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey" ("expiresAt");
