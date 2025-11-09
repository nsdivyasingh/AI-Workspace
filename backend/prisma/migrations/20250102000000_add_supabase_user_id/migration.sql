-- AlterTable: Add supabase_user_id to Employee table
-- This connects Supabase Auth users to Employee records

-- Make password optional (nullable) since Supabase Auth handles passwords
-- Note: This will work even if table has data - existing passwords remain
ALTER TABLE "Employee" ALTER COLUMN "password" DROP NOT NULL;

-- Add supabase_user_id column (nullable UUID)
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "supabase_user_id" UUID;

-- Create unique constraint on supabase_user_id
-- Using partial index to allow multiple NULLs but enforce uniqueness for non-null values
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_supabase_user_id_key" 
ON "Employee"("supabase_user_id") 
WHERE "supabase_user_id" IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Employee_supabase_user_id_idx" ON "Employee"("supabase_user_id");

