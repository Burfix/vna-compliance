-- Migration: Add store slug and update certifications schema
-- Run this in Vercel Postgres Query Editor

-- Step 1: Add new columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Migrate existing data (set code = unitCode, slug from code)
UPDATE stores 
SET code = "unitCode",
    slug = 'tenant-' || LOWER("unitCode")
WHERE code IS NULL;

-- Step 3: Add constraints after data migration
ALTER TABLE stores ADD CONSTRAINT IF NOT EXISTS "stores_code_key" UNIQUE ("code");
ALTER TABLE stores ADD CONSTRAINT IF NOT EXISTS "stores_slug_key" UNIQUE ("slug");

-- Step 4: Drop old certifications table and recreate with new schema
DROP TABLE IF EXISTS certifications CASCADE;

CREATE TABLE certifications (
  "id" TEXT NOT NULL PRIMARY KEY,
  "storeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "referenceNo" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "certifications_storeId_fkey" FOREIGN KEY ("storeId") 
    REFERENCES stores("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS "certifications_storeId_idx" ON certifications("storeId");
CREATE INDEX IF NOT EXISTS "certifications_type_idx" ON certifications("type");

-- Migration complete!
-- Next step: Run the seed script to populate stores and certifications
