import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

// Initialize Supabase client with service role key for server-side admin operations
const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Supabase client for regular auth operations
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Maps Employee role enum to Supabase role name
 */
const roleMapping = {
  'ADMIN': 'admin',
  'MANAGER': 'manager',
  'EMPLOYEE': 'developer', // Using 'developer' as per RBAC requirements
  'INTERN': 'intern'
};

/**
 * Gets role ID from role name in the roles table
 */
async function getRoleId(roleName) {
  try {
    // Use admin client to bypass RLS (Row Level Security) if enabled
    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName.toLowerCase())
      .single();

    if (error || !data) {
      console.error('Error fetching role:', error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error('Error in getRoleId:', err);
    return null;
  }
}

/**
 * Creates a Supabase Auth user and links it to Employee table
 * @param {Object} userData - { name, email, password, role }
 * @returns {Object} - { supabaseUser, employee, roleAssigned }
 */
export async function createSupabaseUserAndEmployee(userData) {
  const { name, email, password, role = 'EMPLOYEE' } = userData;

  try {
    // Validate Supabase configuration
    if (!process.env.PUBLIC_SUPABASE_URL) {
      throw new Error('PUBLIC_SUPABASE_URL is not set in environment variables');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    }

    console.log('🔵 Creating Supabase Auth user for:', email);
    console.log('🔵 Supabase URL:', process.env.PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('🔵 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');

    // 1. Create user in Supabase Auth (using admin client)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for development
      user_metadata: {
        name: name
      }
    });

    if (authError) {
      console.error('❌ Supabase Auth creation error:', authError);
      console.error('❌ Error details:', JSON.stringify(authError, null, 2));
      throw new Error(`Supabase Auth error: ${authError.message} (Code: ${authError.status})`);
    }

    if (!authData || !authData.user) {
      console.error('❌ Supabase Auth returned no user data');
      throw new Error('Failed to create Supabase Auth user: No user data returned');
    }

    const supabaseUserId = authData.user.id;
    console.log('✅ Supabase Auth user created:', supabaseUserId);

    // 2. Create Employee record with Supabase user ID
    console.log('🔵 Creating Employee record for:', email);
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        role,
        supabase_user_id: supabaseUserId,
        // Don't store password in Employee table if using Supabase Auth
        password: null
      }
    });
    console.log('✅ Employee record created:', employee.id, 'with supabase_user_id:', employee.supabase_user_id);

    // 3. Get role ID from roles table
    const roleName = roleMapping[role] || 'developer';
    console.log('🔵 Mapping role:', role, '→', roleName);
    const roleId = await getRoleId(roleName);

    if (!roleId) {
      console.warn(`⚠️  Role ${roleName} not found in roles table. Please ensure roles are seeded.`);
      console.warn('⚠️  Run backend/db/roles.sql in Supabase SQL Editor to seed roles.');
    } else {
      console.log('✅ Found role ID:', roleId, 'for role:', roleName);
      // 4. Assign role in user_roles table (using admin client)
      console.log('🔵 Assigning role in user_roles table...');
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: supabaseUserId,
          role_id: roleId,
          assigned_at: new Date().toISOString()
        });

      if (roleError) {
        console.error('❌ Error assigning role:', roleError);
        console.error('❌ Role error details:', JSON.stringify(roleError, null, 2));
        console.warn('⚠️  Employee is created, but role assignment failed. Role can be assigned later.');
        // Don't throw - employee is created, role can be assigned later
      } else {
        console.log('✅ Role assigned successfully in user_roles table');
      }
    }

    console.log('✅ User creation complete:', {
      supabaseUserId: supabaseUserId,
      employeeId: employee.id,
      email: employee.email,
      role: employee.role,
      roleAssigned: !!roleId
    });

    return {
      supabaseUser: authData.user,
      employee,
      roleAssigned: !!roleId
    };

  } catch (error) {
    console.error('❌ Error creating Supabase user and Employee:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

/**
 * Syncs Employee role to Supabase user_roles table
 * @param {number} employeeId - Employee ID
 * @param {string} role - Role enum (ADMIN, MANAGER, EMPLOYEE, INTERN)
 */
export async function syncEmployeeRoleToSupabase(employeeId, role) {
  try {
    // Get employee with Supabase user ID
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { supabase_user_id: true }
    });

    if (!employee || !employee.supabase_user_id) {
      console.warn(`Employee ${employeeId} has no Supabase user ID. Skipping role sync.`);
      return false;
    }

    // Get role ID
    const roleName = roleMapping[role] || 'developer';
    const roleId = await getRoleId(roleName);

    if (!roleId) {
      console.warn(`Role ${roleName} not found in roles table.`);
      return false;
    }

    // Remove existing roles for this user (using admin client)
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', employee.supabase_user_id);

    // Assign new role (using admin client)
    const { error } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: employee.supabase_user_id,
        role_id: roleId,
        assigned_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error syncing role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in syncEmployeeRoleToSupabase:', error);
    return false;
  }
}

/**
 * Gets Employee record by Supabase user ID
 * @param {string} supabaseUserId - Supabase user UUID
 * @returns {Object|null} - Employee record or null
 */
export async function getEmployeeBySupabaseUserId(supabaseUserId) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { supabase_user_id: supabaseUserId },
      include: {
        tasks: true,
        prs: true
      }
    });

    return employee;
  } catch (error) {
    console.error('Error getting employee by Supabase user ID:', error);
    return null;
  }
}

/**
 * Authenticates user with Supabase Auth and returns Employee record
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object|null} - { supabaseUser, employee, token } or null
 */
export async function authenticateWithSupabase(email, password) {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return null;
    }

    // Get Employee record
    const employee = await getEmployeeBySupabaseUserId(authData.user.id);

    if (!employee) {
      console.warn(`No Employee record found for Supabase user ${authData.user.id}`);
      return null;
    }

    return {
      supabaseUser: authData.user,
      employee,
      token: authData.session.access_token
    };

  } catch (error) {
    console.error('Error authenticating with Supabase:', error);
    return null;
  }
}

/**
 * Links existing Employee to Supabase Auth user
 * @param {number} employeeId - Employee ID
 * @param {string} supabaseUserId - Supabase user UUID
 */
export async function linkEmployeeToSupabaseUser(employeeId, supabaseUserId) {
  try {
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { supabase_user_id: supabaseUserId }
    });

    // Sync role to user_roles table
    await syncEmployeeRoleToSupabase(employeeId, employee.role);

    return employee;
  } catch (error) {
    console.error('Error linking employee to Supabase user:', error);
    throw error;
  }
}

export { supabase, supabaseAdmin, roleMapping };

