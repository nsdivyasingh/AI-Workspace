import dotenv from 'dotenv';

dotenv.config();

/**
 * Checks if Supabase configuration is properly set up
 * @returns {Object} { isValid: boolean, errors: string[], warnings: string[] }
 */
export function checkSupabaseConfig() {
  const errors = [];
  const warnings = [];

  // Check required environment variables
  if (!process.env.PUBLIC_SUPABASE_URL) {
    errors.push('PUBLIC_SUPABASE_URL is not set in .env file');
  } else {
    // Validate URL format
    try {
      new URL(process.env.PUBLIC_SUPABASE_URL);
    } catch (err) {
      errors.push(`PUBLIC_SUPABASE_URL is not a valid URL: ${process.env.PUBLIC_SUPABASE_URL}`);
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  } else {
    // Check if it looks like a JWT token
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT token');
    }
  }

  // Check optional variables
  if (!process.env.SUPABASE_ANON_KEY) {
    warnings.push('SUPABASE_ANON_KEY is not set (will use SERVICE_ROLE_KEY as fallback)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: {
      url: process.env.PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not Set',
      anonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
    }
  };
}

/**
 * Logs Supabase configuration status
 */
export function logSupabaseConfig() {
  const config = checkSupabaseConfig();
  
  console.log('\n=== Supabase Configuration Check ===');
  console.log('URL:', config.config.url);
  console.log('Service Role Key:', config.config.serviceRoleKey);
  console.log('Anon Key:', config.config.anonKey);
  
  if (config.errors.length > 0) {
    console.error('\n❌ Errors:');
    config.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (config.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    config.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (config.isValid) {
    console.log('\n✅ Supabase configuration is valid');
  } else {
    console.error('\n❌ Supabase configuration has errors. Please fix them before proceeding.');
  }
  console.log('===================================\n');
  
  return config;
}

