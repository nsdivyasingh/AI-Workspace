# Quick Fix: Run Migration in Supabase

## The Problem

Prisma migrate is failing because it can't create the shadow database properly. 

## Quick Solution (2 minutes)

### Option 1: Run SQL Directly in Supabase (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Click **SQL Editor** → **New Query**

2. **Run this SQL:**
   ```sql
   -- Make password optional
   ALTER TABLE "Employee" ALTER COLUMN "password" DROP NOT NULL;
   
   -- Add supabase_user_id column
   ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "supabase_user_id" UUID;
   
   -- Create unique index (allows multiple NULLs, enforces uniqueness for non-null values)
   CREATE UNIQUE INDEX IF NOT EXISTS "Employee_supabase_user_id_key" 
   ON "Employee"("supabase_user_id") 
   WHERE "supabase_user_id" IS NOT NULL;
   
   -- Create lookup index
   CREATE INDEX IF NOT EXISTS "Employee_supabase_user_id_idx" 
   ON "Employee"("supabase_user_id");
   ```

3. **Mark migration as applied:**
   ```bash
   cd backend
   npx prisma migrate resolve --applied 20250102000000_add_supabase_user_id --schema .\prisma\schema.prisma
   ```

4. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate --schema .\prisma\schema.prisma
   ```

### Option 2: Delete Migration Folder and Create New One

If you want Prisma to handle it:

```bash
cd backend

# Delete the problematic migration folder
Remove-Item -Recurse -Force "prisma\migrations\20250102000000_add_supabase_user_id"

# Create migration (will generate SQL file)
npx prisma migrate dev --create-only --name add_supabase_user_id --schema .\prisma\schema.prisma

# Review the generated migration file, then run it in Supabase SQL Editor
# Then mark as applied:
npx prisma migrate resolve --applied add_supabase_user_id --schema .\prisma\schema.prisma
```

## Verify It Worked

```sql
-- Check if column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Employee' 
AND column_name = 'supabase_user_id';
```

You should see:
```
column_name        | data_type
-------------------|----------
supabase_user_id   | uuid
```

## That's It!

After running the SQL, your Employee table will have the `supabase_user_id` column and you can start using Supabase Auth integration.

