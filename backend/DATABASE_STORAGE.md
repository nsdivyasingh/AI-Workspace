# Where Are Signup/Login Details Stored?

Your application currently uses **TWO authentication systems**:

## 🔵 System 1: Legacy JWT Auth (Currently Active)

### Database Table: `Employee` (public schema)

**Location:** `public.employee` table

**Schema:**
```sql
Table: employee
├── id (Int, Primary Key, Auto-increment)
├── name (String)
├── email (String, Unique)
├── role (Role enum: ADMIN, MANAGER, EMPLOYEE, INTERN)
├── password (String, Hashed with bcrypt)
└── createdAt (DateTime)
```

**How it works:**
1. **Signup** (`POST /signup`):
   - Password is hashed using `bcrypt` (10 rounds)
   - User is created in `Employee` table
   - Default role: `EMPLOYEE` (hardcoded for security)
   - Returns JWT token signed with `JWT_SECRET`

2. **Login** (`POST /login`):
   - Finds user by email in `Employee` table
   - Compares provided password with hashed password using `bcrypt.compare()`
   - Returns JWT token if credentials match

**Code Location:**
- Signup: `backend/index.js` (lines 33-70)
- Login: `backend/index.js` (lines 73-109)
- Database queries: Uses Prisma Client with `Employee` model

**Example Data:**
```javascript
{
  id: 1,
  name: "Admin User",
  email: "admin@fosys.com",
  role: "ADMIN",
  password: "$2b$10$hashed_password_string...", // bcrypt hash
  createdAt: "2024-01-01T00:00:00Z"
}
```

---

## 🟢 System 2: Supabase Auth (New RBAC System)

### Database Table: `users` (auth schema)

**Location:** `auth.users` table (Supabase managed)

**Schema:**
```sql
Table: auth.users
├── id (UUID, Primary Key)
├── email (String)
├── encrypted_password (String, Supabase encrypted)
├── email_confirmed_at (DateTime)
├── created_at (DateTime)
├── updated_at (DateTime)
└── ... (many other auth-related fields)
```

**Related Tables:**
- `public.user_roles` - Links users to roles
- `public.roles` - Role definitions
- `auth.identities` - OAuth/SSO identities

**How it works:**
1. Users sign up through Supabase Auth SDK
2. Credentials stored in `auth.users` table (managed by Supabase)
3. Roles assigned in `user_roles` junction table
4. Authentication uses Supabase JWT tokens

**Code Location:**
- Middleware: `backend/auth/roleMiddleware.js`
- Routes: `backend/routes/project.js`, `backend/routes/tasks.js`

---

## 📊 Current Status

### ✅ Currently Active: Legacy JWT System
- **Table:** `public.employee`
- **Routes:** `/signup`, `/login`
- **Auth Middleware:** `backend/middleware/auth.js` (protect, restrictTo)
- **Token:** JWT signed with `JWT_SECRET`

### 🚧 In Development: Supabase Auth System
- **Table:** `auth.users` + `public.user_roles`
- **Routes:** `/api/projects/*`, `/api/tasks/*`
- **Auth Middleware:** `backend/auth/roleMiddleware.js` (authorizeRoles)
- **Token:** Supabase Auth JWT

---

## 🔍 How to Check Your Data

### Check Legacy System (Employee table):
```sql
-- View all employees
SELECT id, name, email, role, "createdAt" 
FROM employee;

-- View employee with password hash (for debugging)
SELECT id, name, email, role, password, "createdAt" 
FROM employee 
WHERE email = 'admin@fosys.com';
```

### Check Supabase System (auth.users):
```sql
-- View all Supabase users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users;

-- View user roles
SELECT 
  u.email,
  r.name as role_name,
  ur.assigned_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id;
```

---

## 🔄 Migration Path

To fully migrate to Supabase Auth:

1. **Link existing employees to Supabase users:**
   ```sql
   -- Add supabase_user_id to Employee table
   ALTER TABLE employee ADD COLUMN supabase_user_id UUID;
   
   -- Create Supabase Auth accounts for existing employees
   -- Then link them via supabase_user_id
   ```

2. **Migrate roles:**
   - Map `Employee.role` enum to `roles` table
   - Create entries in `user_roles` table

3. **Update frontend:**
   - Switch from custom JWT to Supabase Auth SDK
   - Update API calls to use Supabase tokens

---

## 🛡️ Security Notes

1. **Passwords are NEVER stored in plain text**
   - Legacy system: bcrypt hashing (10 rounds)
   - Supabase: Encrypted by Supabase

2. **Legacy system passwords:**
   - Stored as: `$2b$10$...` (bcrypt format)
   - Never log or expose raw passwords

3. **Supabase passwords:**
   - Managed by Supabase Auth
   - Encrypted and secure by default

---

## 📝 Summary

**Your signup/login details are stored in:**

1. **Current active system:** `public.employee` table
   - Used by `/signup` and `/login` routes
   - Passwords hashed with bcrypt
   - Roles stored directly in the table

2. **New system (when fully migrated):** `auth.users` + `public.user_roles`
   - Managed by Supabase Auth
   - Roles stored in junction table
   - More flexible and scalable

Both systems exist in your database, but the legacy system is currently active for authentication.

