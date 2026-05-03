CREATE TABLE "ThemeBlock" (
	"id" text PRIMARY KEY NOT NULL,
	"sectionId" text NOT NULL,
	"type" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ThemeSection" (
	"id" text PRIMARY KEY NOT NULL,
	"themeId" text NOT NULL,
	"type" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Theme" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"name" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ThemeBlock" ADD CONSTRAINT "ThemeBlock_sectionId_ThemeSection_id_fk" FOREIGN KEY ("sectionId") REFERENCES "public"."ThemeSection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ThemeSection" ADD CONSTRAINT "ThemeSection_themeId_Theme_id_fk" FOREIGN KEY ("themeId") REFERENCES "public"."Theme"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ThemeBlock_sectionId_idx" ON "ThemeBlock" USING btree ("sectionId");--> statement-breakpoint
CREATE INDEX "ThemeBlock_position_idx" ON "ThemeBlock" USING btree ("sectionId","position");--> statement-breakpoint
CREATE INDEX "ThemeSection_themeId_idx" ON "ThemeSection" USING btree ("themeId");--> statement-breakpoint
CREATE INDEX "ThemeSection_position_idx" ON "ThemeSection" USING btree ("themeId","position");--> statement-breakpoint
CREATE INDEX "Theme_storeId_idx" ON "Theme" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "Theme_isPublished_idx" ON "Theme" USING btree ("isPublished");