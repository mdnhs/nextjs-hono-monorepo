-- Drop the default value first to remove the dependency
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint

-- Convert column to text temporarily
ALTER TABLE "User" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint

-- Update existing data: Rename ADMIN to PLATFORM_ADMIN
UPDATE "User" SET "role" = 'PLATFORM_ADMIN' WHERE "role" = 'ADMIN';--> statement-breakpoint

-- Now we can safely drop and recreate the type
DROP TYPE "public"."UserRole";--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('BUYER', 'STORE_ADMIN', 'SELLER', 'PLATFORM_ADMIN');--> statement-breakpoint

-- Convert column back to the new enum type
ALTER TABLE "User" ALTER COLUMN "role" SET DATA TYPE "public"."UserRole" USING "role"::"public"."UserRole";--> statement-breakpoint

-- Restore the default value
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'SELLER'::"UserRole";
