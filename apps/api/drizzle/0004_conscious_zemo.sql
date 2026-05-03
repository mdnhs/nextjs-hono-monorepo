-- Legacy carts were bound only to a platform User without any store context, so they
-- cannot be migrated forward into the per-store cart model. Wipe them before reshape.
DELETE FROM "CartItem";--> statement-breakpoint
DELETE FROM "Cart";--> statement-breakpoint
-- Use IF EXISTS guards: dev DBs may already have these dropped from prior partial runs.
-- Also handle legacy Prisma naming (Cart_userId_key) and Drizzle naming (Cart_userId_unique).
-- We handle both INDEX and CONSTRAINT forms to be safe across different bootstrapping paths.
DO $$ BEGIN
  ALTER TABLE "Cart" DROP CONSTRAINT IF EXISTS "Cart_userId_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  DROP INDEX IF EXISTS "Cart_userId_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Cart" DROP CONSTRAINT IF EXISTS "Cart_userId_key";
EXCEPTION WHEN undefined_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  DROP INDEX IF EXISTS "Cart_userId_key";
EXCEPTION WHEN undefined_object THEN NULL; END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "CartItem_cartId_productId_key";--> statement-breakpoint
ALTER TABLE "Cart" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "storeId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "customerId" text;--> statement-breakpoint
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "cartToken" text;--> statement-breakpoint
ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" text;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestEmail" text;--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestName" text;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Cart" ADD CONSTRAINT "Cart_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_variantId_key" ON "CartItem" USING btree ("cartId","variantId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_storeId_customerId_uq" ON "Cart" USING btree ("storeId","customerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Cart_storeId_idx" ON "Cart" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Cart_customerId_idx" ON "Cart" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Cart_cartToken_idx" ON "Cart" USING btree ("cartToken");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order" USING btree ("customerId");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "Cart" ADD CONSTRAINT "Cart_cartToken_unique" UNIQUE("cartToken");
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
