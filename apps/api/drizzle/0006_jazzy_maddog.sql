CREATE TYPE "public"."DomainVerificationStatus" AS ENUM('PENDING', 'VERIFIED', 'FAILED');--> statement-breakpoint
CREATE TABLE "DomainVerification" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"hostname" text NOT NULL,
	"txtToken" text NOT NULL,
	"status" "DomainVerificationStatus" DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lastCheckedAt" timestamp,
	"verifiedAt" timestamp,
	"failureReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "DomainVerification" ADD CONSTRAINT "DomainVerification_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "DomainVerification_hostname_uq" ON "DomainVerification" USING btree ("hostname");--> statement-breakpoint
CREATE INDEX "DomainVerification_storeId_idx" ON "DomainVerification" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "DomainVerification_status_idx" ON "DomainVerification" USING btree ("status");