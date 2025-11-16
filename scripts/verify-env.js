#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * 
 * Verifies that all required environment variables are set for production deployment.
 * Run this before deploying to catch missing configuration.
 */

const requiredVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'Production database connection string (PostgreSQL)',
    validate: (val) => val && val.startsWith('postgresql://') || val.startsWith('postgres://'),
    error: 'Must be a PostgreSQL connection string (starts with postgresql:// or postgres://)'
  },

  // Base URL
  NEXT_PUBLIC_BASE_URL: {
    required: true,
    description: 'Production URL (e.g., https://flyinghotair.com)',
    validate: (val) => val && (val.startsWith('http://') || val.startsWith('https://')),
    error: 'Must be a valid URL starting with http:// or https://'
  },

  // Stripe
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Production Stripe secret key (sk_live_...)',
    validate: (val) => val && (val.startsWith('sk_live_') || val.startsWith('sk_test_')),
    error: 'Must start with sk_live_ (production) or sk_test_ (testing)',
    warning: (val) => val && val.startsWith('sk_test_') ? 'Using test key - switch to sk_live_ for production' : null
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    description: 'Production Stripe publishable key (pk_live_...)',
    validate: (val) => val && (val.startsWith('pk_live_') || val.startsWith('pk_test_')),
    error: 'Must start with pk_live_ (production) or pk_test_ (testing)',
    warning: (val) => val && val.startsWith('pk_test_') ? 'Using test key - switch to pk_live_ for production' : null
  },
  STRIPE_WEBHOOK_SECRET: {
    required: true,
    description: 'Production Stripe webhook secret (whsec_...)',
    validate: (val) => val && val.startsWith('whsec_'),
    error: 'Must start with whsec_'
  },

  // Twilio
  TWILIO_ACCOUNT_SID: {
    required: true,
    description: 'Production Twilio Account SID',
    validate: (val) => val && val.length > 0,
    error: 'Cannot be empty'
  },
  TWILIO_AUTH_TOKEN: {
    required: true,
    description: 'Production Twilio Auth Token',
    validate: (val) => val && val.length > 0,
    error: 'Cannot be empty'
  },
  TWILIO_FROM_NUMBER: {
    required: true,
    description: 'Production Twilio phone number',
    validate: (val) => val && val.length > 0,
    error: 'Cannot be empty'
  },

  // Admin
  ADMIN_TOKEN: {
    required: true,
    description: 'Secure random token for admin API access',
    validate: (val) => val && val.length >= 32,
    error: 'Must be at least 32 characters for security',
    warning: (val) => val && val.length < 64 ? 'Consider using 64+ characters for better security' : null
  },
  NEXT_PUBLIC_ADMIN_TOKEN: {
    required: true,
    description: 'Same as ADMIN_TOKEN for client-side requests',
    validate: (val) => val && val.length >= 32,
    error: 'Must be at least 32 characters for security'
  },

  // Optional but recommended
  PLATFORM_FEE_BPS: {
    required: false,
    description: 'Platform fee in basis points (default: 1000 = 10%)',
    validate: (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10000),
    error: 'Must be a number between 0 and 10000 (0% to 100%)'
  },
  NODE_ENV: {
    required: false,
    description: 'Node environment (should be "production")',
    validate: (val) => !val || ['production', 'development', 'test'].includes(val),
    error: 'Must be production, development, or test',
    warning: (val) => val && val !== 'production' ? 'NODE_ENV should be "production" for production deployment' : null
  }
};

function verifyEnv() {
  console.log('🔍 Verifying Environment Variables\n');
  console.log('='.repeat(60));

  const missing = [];
  const invalid = [];
  const warnings = [];

  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    const isSet = value !== undefined && value !== '';

    if (!isSet) {
      if (config.required) {
        missing.push({ name: varName, description: config.description });
      }
      continue;
    }

    if (config.validate && !config.validate(value)) {
      invalid.push({
        name: varName,
        description: config.description,
        error: config.error,
        value: value.substring(0, 20) + (value.length > 20 ? '...' : '')
      });
    }

    if (config.warning) {
      const warning = config.warning(value);
      if (warning) {
        warnings.push({ name: varName, message: warning });
      }
    }
  }

  // Report results
  if (missing.length > 0) {
    console.log('\n❌ MISSING REQUIRED VARIABLES:');
    missing.forEach(({ name, description }) => {
      console.log(`   - ${name}: ${description}`);
    });
  }

  if (invalid.length > 0) {
    console.log('\n⚠️  INVALID VARIABLES:');
    invalid.forEach(({ name, description, error, value }) => {
      console.log(`   - ${name}: ${description}`);
      console.log(`     Error: ${error}`);
      console.log(`     Current value: ${value}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(({ name, message }) => {
      console.log(`   - ${name}: ${message}`);
    });
  }

  if (missing.length === 0 && invalid.length === 0) {
    console.log('\n✅ All required environment variables are set and valid!');
    if (warnings.length > 0) {
      console.log('   (Some warnings above - review before deploying)');
    }
    console.log('\n📋 Summary:');
    console.log(`   - Required variables: ${Object.values(requiredVars).filter(v => v.required).length}`);
    console.log(`   - Optional variables: ${Object.values(requiredVars).filter(v => !v.required).length}`);
    console.log(`   - Total checked: ${Object.keys(requiredVars).length}`);
    return true;
  } else {
    console.log('\n❌ Environment variable verification failed!');
    console.log('   Please fix the issues above before deploying.');
    return false;
  }
}

// Run verification
const success = verifyEnv();
process.exit(success ? 0 : 1);

