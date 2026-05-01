-- AlterEnum: Handle StoreStatus enum transition
-- Step 1: Create a new enum type with the new values
CREATE TYPE "StoreStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- Step 2: Drop default, convert to text
ALTER TABLE "Store" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Store" ALTER COLUMN "status" TYPE text USING "status"::text;

-- Step 3: Map old values to new values while column is text
UPDATE "Store" SET "status" = 'PENDING' WHERE "status" = 'DRAFT';
UPDATE "Store" SET "status" = 'APPROVED' WHERE "status" = 'PUBLISHED';
UPDATE "Store" SET "status" = 'PENDING' WHERE "status" NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- Step 4: Convert to new enum, set new default
ALTER TABLE "Store" ALTER COLUMN "status" TYPE "StoreStatus_new" USING "status"::text::"StoreStatus_new";
ALTER TABLE "Store" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Step 5: Drop old enum
DROP TYPE "StoreStatus";
ALTER TYPE "StoreStatus_new" RENAME TO "StoreStatus";

-- CreateEnum: BillingCycle
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum: SubscriptionStatus
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL', 'PAST_DUE');

-- CreateEnum: PlanStatus
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'HIDDEN');

-- CreateTable: Plan
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "priceMonthly" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "priceYearly" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "maxStores" INTEGER NOT NULL DEFAULT 1,
    "maxProducts" INTEGER NOT NULL DEFAULT 100,
    "maxOrders" INTEGER,
    "maxStorageMB" INTEGER NOT NULL DEFAULT 100,
    "customDomain" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "removeBranding" BOOLEAN NOT NULL DEFAULT false,
    "apiAccess" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Subscription
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "storeId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add customDomain to Store
ALTER TABLE "Store" ADD COLUMN "customDomain" TEXT;

-- CreateIndex: Plan unique constraints
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex: Store customDomain unique
CREATE UNIQUE INDEX "Store_customDomain_key" ON "Store"("customDomain");

-- CreateIndex: Subscription unique and indexes
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_storeId_idx" ON "Subscription"("storeId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- AddForeignKey: Subscription -> Store
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Subscription -> Plan
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert default plans
INSERT INTO "Plan" ("id", "name", "slug", "description", "status", "priceMonthly", "priceYearly", "trialDays", "maxStores", "maxProducts", "maxOrders", "maxStorageMB", "customDomain", "analytics", "prioritySupport", "removeBranding", "apiAccess", "features", "createdAt", "updatedAt") VALUES
  ('plan_starter', 'Starter', 'starter', 'Perfect for new sellers', 'ACTIVE', 0, 0, 14, 1, 50, 100, 100, false, false, false, false, false, '{"features": ["basic_analytics", "email_support"]}'::jsonb, NOW(), NOW()),
  ('plan_basic', 'Basic', 'basic', 'For growing businesses', 'ACTIVE', 9.99, 99.99, 0, 1, 200, 500, 500, false, true, false, false, false, '{"features": ["basic_analytics", "email_support", "custom_email"]}'::jsonb, NOW(), NOW()),
  ('plan_pro', 'Pro', 'pro', 'For established sellers', 'ACTIVE', 29.99, 299.99, 0, 3, 1000, NULL, 2000, true, true, false, true, true, '{"features": ["advanced_analytics", "priority_support", "custom_email", "api_access", "remove_branding"]}'::jsonb, NOW(), NOW()),
  ('plan_enterprise', 'Enterprise', 'enterprise', 'Unlimited scale', 'ACTIVE', 99.99, 999.99, 0, NULL, NULL, NULL, 10000, true, true, true, true, true, '{"features": ["advanced_analytics", "priority_support", "custom_email", "api_access", "remove_branding", "white_label", "dedicated_support"]}'::jsonb, NOW(), NOW());
