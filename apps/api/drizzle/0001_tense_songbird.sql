CREATE TABLE "Discount" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"valueCents" bigint,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp,
	"usageLimit" integer,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"minOrderAmountCents" bigint,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "InventoryLevel" (
	"id" text PRIMARY KEY NOT NULL,
	"variantId" text NOT NULL,
	"locationId" text NOT NULL,
	"available" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"onHand" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "InventoryTransaction" (
	"id" text PRIMARY KEY NOT NULL,
	"inventoryLevelId" text NOT NULL,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text,
	"referenceId" text,
	"referenceType" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Location" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"isDefault" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"storeId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "ShippingRate" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"priceCents" bigint NOT NULL,
	"minWeightGrams" integer,
	"maxWeightGrams" integer,
	"minOrderAmountCents" bigint,
	"maxOrderAmountCents" bigint,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TaxRate" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"name" text NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"zip" text,
	"isInclusive" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WebhookDelivery" (
	"id" text PRIMARY KEY NOT NULL,
	"webhookId" text NOT NULL,
	"topic" text NOT NULL,
	"payload" jsonb NOT NULL,
	"responseStatus" integer,
	"responseBody" text,
	"errorMessage" text,
	"attempt" integer DEFAULT 1 NOT NULL,
	"succeeded" boolean DEFAULT false NOT NULL,
	"deliveredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Webhook" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"topic" text NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_unique";
    ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key";
    ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_unique";
    ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key";
EXCEPTION
    WHEN undefined_column THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "Category" ADD COLUMN "storeId" text;--> statement-breakpoint
UPDATE "Category" SET "storeId" = (SELECT id FROM "Store" LIMIT 1) WHERE "storeId" IS NULL;--> statement-breakpoint
ALTER TABLE "Category" ALTER COLUMN "storeId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_variantId_ProductVariant_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_locationId_Location_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_inventoryLevelId_InventoryLevel_id_fk" FOREIGN KEY ("inventoryLevelId") REFERENCES "public"."InventoryLevel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Location" ADD CONSTRAINT "Location_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ShippingRate" ADD CONSTRAINT "ShippingRate_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_Webhook_id_fk" FOREIGN KEY ("webhookId") REFERENCES "public"."Webhook"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "Discount_storeId_code_key" ON "Discount" USING btree ("storeId","code");--> statement-breakpoint
CREATE INDEX "Discount_storeId_idx" ON "Discount" USING btree ("storeId");--> statement-breakpoint
CREATE UNIQUE INDEX "InventoryLevel_variantId_locationId_key" ON "InventoryLevel" USING btree ("variantId","locationId");--> statement-breakpoint
CREATE INDEX "InventoryLevel_variantId_idx" ON "InventoryLevel" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX "InventoryLevel_locationId_idx" ON "InventoryLevel" USING btree ("locationId");--> statement-breakpoint
CREATE INDEX "InventoryTransaction_inventoryLevelId_idx" ON "InventoryTransaction" USING btree ("inventoryLevelId");--> statement-breakpoint
CREATE INDEX "Location_storeId_idx" ON "Location" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "ShippingRate_storeId_idx" ON "ShippingRate" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "TaxRate_storeId_idx" ON "TaxRate" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery" USING btree ("webhookId");--> statement-breakpoint
CREATE INDEX "WebhookDelivery_succeeded_idx" ON "WebhookDelivery" USING btree ("succeeded");--> statement-breakpoint
CREATE INDEX "Webhook_storeId_idx" ON "Webhook" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "Webhook_topic_idx" ON "Webhook" USING btree ("topic");--> statement-breakpoint
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "Category_storeId_name_key" ON "Category" USING btree ("storeId","name");--> statement-breakpoint
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category" USING btree ("storeId","slug");--> statement-breakpoint
CREATE INDEX "Category_storeId_idx" ON "Category" USING btree ("storeId");--> statement-breakpoint
ALTER TABLE "ProductVariant" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "quantity";