# Migration Guide: Adding Supabase User ID to Employee Table

## Problem

You're getting this error:
```
Migration `add_supabase_user_id` failed to apply cleanly to the shadow database.
Error: The underlying table for model `employee` does not exist.
```

This happens because Prisma is trying to create a shadow database and the migration structure isn't set up correctly.

## Solution: Manual Migration in Supabase

Since you're using Supabase, the easiest way is to run the migration SQL directly in Supabase SQL Editor.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run the Migration SQL

Copy and paste this SQL:

```sql
-- Make password optional (nullable) since Supabase Auth handles passwords
ALTER TABLE "Employee" ALTER COLUMN "password" DROP NOT NULL;

-- Add supabase_user_id column (nullable UUID)
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "supabase_user_id" UUID;

-- Create unique constraint on supabase_user_id (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_supabase_user_id_key" 
ON "Employee"("supabase_user_id") 
WHERE "supabase_user_id" IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Employee_supabase_user_id_idx" 
ON "Employee"("supabase_user_id");
```

### Step 3: Mark Migration as Applied in Prisma

After running the SQL manually, you need to tell Prisma that the migration was applied:

```bash
cd backend
npx prisma migrate resolve --applied 20250102000000_add_supabase_user_id --schema .\prisma\schema.prisma
```

Or if that doesn't work, you can manually add it to the `_prisma_migrations` table:

```sql
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  'your_checksum_here',
  NOW(),
  '20250102000000_add_supabase_user_id',
  NULL,
  NULL,
  NOW(),
  1
);
```

### Alternative: Use Prisma Migrate with --create-only

If you want Prisma to generate the migration:

```bash
cd backend
npx prisma migrate dev --create-only --name add_supabase_user_id --schema .\prisma\schema.prisma
```

This will create the migration file without applying it. Then you can:
1. Review the generated migration
2. Run it manually in Supabase
3. Mark it as applied using `prisma migrate resolve`

## Verify the Migration

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Employee' 
AND column_name = 'supabase_user_id';

-- Check if index exists
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'Employee' 
AND indexname LIKE '%supabase_user_id%';
```

## Update Prisma Client

After the migration, regenerate Prisma Client:

```bash
cd backend
npx prisma generate --schema .\prisma\schema.prisma
```

## Troubleshooting

### Error: "column does not exist"
- Make sure you're using the correct table name: `"Employee"` (with capital E)
- Check if the table exists: `SELECT * FROM "Employee" LIMIT 1;`

### Error: "cannot alter column because it has a default value"
- If password has a default, you may need to drop the default first:
  ```sql
  ALTER TABLE "Employee" ALTER COLUMN "password" DROP DEFAULT;
  ALTER TABLE "Employee" ALTER COLUMN "password" DROP NOT NULL;
  ```

### Error: "relation already exists"
- The column or index already exists - this is fine, the migration uses `IF NOT EXISTS`
- You can safely ignore this or check what already exists

## Next Steps

After the migration is complete:

1. ✅ Update your `.env` file with Supabase credentials
2. ✅ Test the signup endpoint - it should create Supabase Auth users
3. ✅ Test the login endpoint - it should use Supabase Auth
4. ✅ Verify roles are being synced to `user_roles` table

## Quick Test

After migration, test with:

```sql
-- Check Employee table structure
\d "Employee"

-- Or using SQL
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Employee'
ORDER BY ordinal_position;
```

