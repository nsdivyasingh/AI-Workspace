# Supabase Auth + Employee Table Integration Guide

This guide explains how Supabase Auth is now connected to your Employee table.

## Overview

Your authentication system now integrates Supabase Auth with the Employee table:

1. **New users**: Created in both Supabase Auth (`auth.users`) and Employee table (`public.employee`)
2. **Role management**: Roles are synced between Employee table and `user_roles` junction table
3. **Authentication**: Login uses Supabase Auth, but Employee records are still maintained

## Database Changes

### Employee Table Schema

The `Employee` table now has:

```sql
- id (Int, Primary Key)
- name (String)
- email (String, Unique)
- role (Role enum: ADMIN, MANAGER, EMPLOYEE, INTERN)
- password (String?, Optional - can be null for Supabase Auth users)
- supabase_user_id (UUID?, Unique) - Links to auth.users(id)
- createdAt (DateTime)
```

### Migration

Run the migration SQL file:
```bash
# In Supabase SQL Editor
backend/prisma/migrations/add_supabase_user_id/migration.sql
```

Or create a Prisma migration:
```bash
cd backend
npx prisma migrate dev --name add_supabase_user_id
```

## How It Works

### Signup Flow

1. User signs up via `POST /signup`
2. Supabase Auth user is created in `auth.users`
3. Employee record is created in `public.employee` with `supabase_user_id`
4. Role is assigned in `public.user_roles` table
5. Both JWT (legacy) and Supabase tokens are returned

### Login Flow

1. User logs in via `POST /login`
2. Authentication happens via Supabase Auth
3. Employee record is looked up by `supabase_user_id`
4. Role is retrieved from `user_roles` table (falls back to Employee.role if needed)
5. Both JWT (legacy) and Supabase tokens are returned

### Role Management

Roles are automatically synced:
- When Employee is created → Role assigned in `user_roles`
- When Employee role changes → Role updated in `user_roles`
- Role mapping: `ADMIN` → `admin`, `EMPLOYEE` → `developer`, etc.

## API Endpoints

### Signup
```bash
POST /signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "token": "jwt_token",
  "supabaseToken": "supabase_session_token",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "supabaseUserId": "uuid-here"
  }
}
```

### Login
```bash
POST /login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "token": "jwt_token",
  "supabaseToken": "supabase_session_token",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "supabaseUserId": "uuid-here"
  }
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key  # Optional, falls back to service_role_key

# Legacy JWT (still used for backward compatibility)
JWT_SECRET=your_jwt_secret
```

## Migration of Existing Users

To migrate existing employees to Supabase Auth:

### Option 1: Manual Migration Script

```javascript
// migrate-employees.js
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateEmployees() {
  const employees = await prisma.employee.findMany({
    where: { supabase_user_id: null }
  });

  for (const employee of employees) {
    try {
      // Create Supabase Auth user
      // Note: You'll need to temporarily store plain passwords or reset them
      const { data, error } = await supabase.auth.admin.createUser({
        email: employee.email,
        password: "TempPassword123!", // User should reset
        email_confirm: true,
        user_metadata: { name: employee.name }
      });

      if (error) {
        console.error(`Error creating user for ${employee.email}:`, error);
        continue;
      }

      // Link Employee to Supabase user
      await prisma.employee.update({
        where: { id: employee.id },
        data: { supabase_user_id: data.user.id }
      });

      // Sync role to user_roles table
      // (Use syncEmployeeRoleToSupabase function)

      console.log(`✅ Migrated ${employee.email}`);
    } catch (err) {
      console.error(`Error migrating ${employee.email}:`, err);
    }
  }
}

migrateEmployees();
```

### Option 2: Gradual Migration

Existing users can continue using legacy authentication until they:
1. Reset their password (creates Supabase Auth account)
2. Are manually migrated by admin

## Role Mapping

| Employee.role (Enum) | roles.name (Database) | Description |
|---------------------|----------------------|-------------|
| ADMIN | `admin` | Full privileges |
| MANAGER | `manager` | Project oversight |
| EMPLOYEE | `developer` | Core contributor |
| INTERN | `intern` | Training mode |

## Helper Functions

### `createSupabaseUserAndEmployee(userData)`
Creates both Supabase Auth user and Employee record, links them, and assigns role.

### `authenticateWithSupabase(email, password)`
Authenticates with Supabase Auth and returns Employee record.

### `syncEmployeeRoleToSupabase(employeeId, role)`
Syncs Employee role to `user_roles` table.

### `getEmployeeBySupabaseUserId(supabaseUserId)`
Gets Employee record by Supabase user ID.

### `linkEmployeeToSupabaseUser(employeeId, supabaseUserId)`
Links existing Employee to Supabase Auth user.

## Troubleshooting

### Error: "Supabase Auth error: User already registered"
- User already exists in Supabase Auth
- Check `auth.users` table
- Use `linkEmployeeToSupabaseUser` to link existing Employee

### Error: "User role not found"
- Role not assigned in `user_roles` table
- Run `syncEmployeeRoleToSupabase` to sync role
- Ensure roles are seeded in `roles` table

### Error: "No Employee record found for Supabase user"
- Employee record missing or not linked
- Check `employee.supabase_user_id` column
- Link Employee using `linkEmployeeToSupabaseUser`

## Next Steps

1. **Run Migration**: Execute the SQL migration or Prisma migrate
2. **Seed Roles**: Ensure `roles` table is populated (run `backend/db/roles.sql`)
3. **Test Signup**: Create a new user and verify both records are created
4. **Test Login**: Verify authentication works with Supabase Auth
5. **Migrate Existing Users**: Use migration script or gradual migration

## Benefits

✅ **Unified Auth**: Single source of truth for authentication (Supabase Auth)  
✅ **RBAC Integration**: Roles managed in `user_roles` table  
✅ **Backward Compatible**: Legacy JWT tokens still work  
✅ **Flexible**: Employee table maintains business logic, Supabase handles auth  
✅ **Scalable**: Easy to add OAuth, MFA, etc. via Supabase

