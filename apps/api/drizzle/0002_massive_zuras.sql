CREATE TYPE "public"."StoreStaffRole" AS ENUM('MANAGER', 'EDITOR', 'SUPPORT');--> statement-breakpoint
CREATE TABLE "Asset" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"sizeBytes" integer NOT NULL,
	"fileName" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "NavigationItem" (
	"id" text PRIMARY KEY NOT NULL,
	"navigationId" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"parentId" text,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Navigation" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Page" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StoreStaff" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "StoreStaffRole" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ThemeSetting" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"colors" jsonb DEFAULT '{"primary":"#000000","secondary":"#ffffff"}'::jsonb NOT NULL,
	"fonts" jsonb DEFAULT '{"heading":"Inter","body":"Inter"}'::jsonb NOT NULL,
	"layout" jsonb DEFAULT '{"header":"default","footer":"default"}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ThemeSetting_storeId_unique" UNIQUE("storeId")
);
--> statement-breakpoint
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_navigationId_Navigation_id_fk" FOREIGN KEY ("navigationId") REFERENCES "public"."Navigation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Page" ADD CONSTRAINT "Page_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StoreStaff" ADD CONSTRAINT "StoreStaff_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StoreStaff" ADD CONSTRAINT "StoreStaff_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ThemeSetting" ADD CONSTRAINT "ThemeSetting_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Asset_storeId_idx" ON "Asset" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "NavigationItem_navigationId_idx" ON "NavigationItem" USING btree ("navigationId");--> statement-breakpoint
CREATE UNIQUE INDEX "Navigation_storeId_handle_key" ON "Navigation" USING btree ("storeId","handle");--> statement-breakpoint
CREATE INDEX "Navigation_storeId_idx" ON "Navigation" USING btree ("storeId");--> statement-breakpoint
CREATE UNIQUE INDEX "Page_storeId_slug_key" ON "Page" USING btree ("storeId","slug");--> statement-breakpoint
CREATE INDEX "Page_storeId_idx" ON "Page" USING btree ("storeId");--> statement-breakpoint
CREATE UNIQUE INDEX "StoreStaff_storeId_userId_key" ON "StoreStaff" USING btree ("storeId","userId");--> statement-breakpoint
CREATE INDEX "StoreStaff_storeId_idx" ON "StoreStaff" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "StoreStaff_userId_idx" ON "StoreStaff" USING btree ("userId");