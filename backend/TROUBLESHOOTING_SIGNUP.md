# Troubleshooting Signup Issues

## Problem: User created in Employee table but not in Supabase Auth

### Symptoms
- ✅ User appears in `Employee` table
- ✅ `supabase_user_id` column exists (might be NULL or have a value)
- ❌ User does NOT appear in Supabase Auth Dashboard → Authentication → Users
- ❌ Login fails or uses legacy authentication

### Root Causes

#### 1. Missing PUBLIC_SUPABASE_URL
**Check:**
```bash
# In your .env file, do you have:
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

**Fix:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy "Project URL"
4. Add to `.env`:
   ```env
   PUBLIC_SUPABASE_URL=https://lqfxbenyazhbxgnikmvu.supabase.co
   ```

#### 2. Invalid Service Role Key
**Check:**
- Your service role key should start with `eyJ` (JWT token format)
- It should be the `service_role` key, NOT the `anon` key

**Fix:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy "service_role" key (⚠️ Keep this secret!)
4. Add to `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### 3. Supabase Auth Creation Failing Silently
**Check server logs:**
- Look for errors like "Supabase Auth error"
- Check if `supabase_user_id` is NULL in Employee table

**Debug:**
The code now has better logging. Check your server console for:
- `🔵 Creating Supabase Auth user for: email@example.com`
- `✅ Supabase Auth user created: uuid-here`
- `❌ Supabase Auth creation error: ...`

#### 4. Database Connection Issues
**Check:**
- Can your server reach Supabase?
- Is there a firewall blocking connections?
- Check network connectivity

## Problem: User has supabase_user_id but login uses legacy auth

### Symptoms
- ✅ User has `supabase_user_id` in Employee table
- ✅ User exists in Supabase Auth
- ❌ Login still uses legacy bcrypt authentication

### Root Cause
The login route tries Supabase Auth first, but if it fails, it falls back to legacy auth.

### How It Works

```javascript
// Login flow:
1. Try Supabase Auth authentication
   ↓
2. If fails → Check if Employee has supabase_user_id
   ↓
3. If has supabase_user_id → Error (should use Supabase Auth)
   ↓
4. If no supabase_user_id → Use legacy bcrypt auth
```

### Fix

**Check if Supabase Auth is working:**
```bash
# Test Supabase Auth directly
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Check server logs:**
- Look for "Error authenticating with Supabase"
- Check if Supabase URL and keys are correct

## Problem: Roles not being assigned

### Symptoms
- ✅ User created in Supabase Auth
- ✅ User created in Employee table
- ❌ Role not assigned in `user_roles` table
- ❌ `roleAssigned: false` in response

### Root Causes

#### 1. Roles table not seeded
**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM roles;
```

**Fix:**
Run `backend/db/roles.sql` in Supabase SQL Editor

#### 2. Role name mismatch
**Check:**
- Employee.role = 'EMPLOYEE'
- But roles table has 'developer' (not 'employee')

**This is correct!** The mapping is:
- EMPLOYEE → developer (in roles table)
- ADMIN → admin
- MANAGER → manager
- INTERN → intern

#### 3. user_roles table doesn't exist
**Check:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_roles;
```

**Fix:**
Run `backend/db/user_roles.sql` in Supabase SQL Editor

## Debugging Steps

### Step 1: Check Environment Variables
```bash
# In your backend directory
node -e "require('dotenv').config(); console.log('URL:', process.env.PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'); console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');"
```

### Step 2: Check Server Logs
Look for these log messages when signing up:
- `🔵 Creating Supabase Auth user for: ...`
- `✅ Supabase Auth user created: ...`
- `✅ Employee record created: ...`
- `✅ Role assigned successfully`

If you see `❌` messages, check the error details.

### Step 3: Verify in Supabase Dashboard
1. Go to Supabase Dashboard
2. Authentication → Users
3. Check if user exists
4. Check user email and metadata

### Step 4: Check Database
```sql
-- Check Employee table
SELECT id, name, email, role, supabase_user_id 
FROM "Employee" 
WHERE email = 'user@example.com';

-- Check if user exists in Supabase Auth
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'user@example.com';

-- Check role assignment
SELECT ur.user_id, r.name as role_name, ur.assigned_at
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = 'uuid-from-employee-table';
```

### Step 5: Test Supabase Connection
```javascript
// Create a test file: test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test creating a user
const { data, error } = await supabase.auth.admin.createUser({
  email: 'test@example.com',
  password: 'test123',
  email_confirm: true
});

console.log('Data:', data);
console.log('Error:', error);
```

Run: `node test-supabase.js`

## Common Error Messages

### "PUBLIC_SUPABASE_URL is not set"
**Fix:** Add `PUBLIC_SUPABASE_URL` to `.env` file

### "SUPABASE_SERVICE_ROLE_KEY is not set"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` file

### "Supabase Auth error: User already registered"
**Fix:** User already exists in Supabase Auth. Check Supabase Dashboard.

### "Role developer not found in roles table"
**Fix:** Run `backend/db/roles.sql` to seed roles table

### "relation user_roles does not exist"
**Fix:** Run `backend/db/user_roles.sql` to create user_roles table

## Quick Fix Checklist

- [ ] `PUBLIC_SUPABASE_URL` is set in `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
- [ ] Roles table is seeded (run `backend/db/roles.sql`)
- [ ] user_roles table exists (run `backend/db/user_roles.sql`)
- [ ] `supabase_user_id` column exists in Employee table (run migration)
- [ ] Server can reach Supabase (check network/firewall)
- [ ] Check server logs for detailed error messages

## Still Not Working?

1. **Check server logs** - The code now has detailed logging
2. **Verify Supabase credentials** - Test in Supabase Dashboard
3. **Test Supabase connection** - Use the test script above
4. **Check database** - Verify tables and data exist
5. **Restart server** - After changing `.env` variables

## Your Specific Case

Based on your issues:

1. **User not in Supabase Auth**:
   - Check if `PUBLIC_SUPABASE_URL` is set
   - Check server logs for Supabase Auth creation errors
   - Verify service role key is correct

2. **supabase_user_id exists but user not in Auth**:
   - User might have been created before Supabase Auth was set up
   - Check if the UUID in `supabase_user_id` exists in `auth.users` table
   - If UUID is invalid, the user needs to be recreated

3. **Legacy auth fallback**:
   - This happens when Supabase Auth authentication fails
   - Check if user has `supabase_user_id` - if yes, they should use Supabase Auth
   - If `supabase_user_id` is NULL, legacy auth is used (for old users)

4. **Environment variables**:
   - You have `SUPABASE_SERVICE_ROLE_KEY` ✅
   - **Check if `PUBLIC_SUPABASE_URL` is set** ⚠️
   - It should be: `https://lqfxbenyazhbxgnikmvu.supabase.co`

