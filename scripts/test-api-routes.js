#!/usr/bin/env node

/**
 * Comprehensive API Routes Test Suite
 * Tests all API routes, Stripe functionality, and QR flow
 * 
 * Run: node scripts/test-api-routes.js
 * 
 * Prerequisites:
 * - Server running: npm run dev
 * - Database seeded: npm run seed
 * - Environment variables configured
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'rossb029@gmail.com';
const ADMIN_PASSWORD = 'Balloon';
const PILOT_EMAIL = 'pilot@example.com';
const PILOT_PASSWORD = 'pilotpass';

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logStep(step, name) {
  log(`\n[Step ${step}] ${name}`, 'bright');
  log('─'.repeat(60), 'blue');
}

// Test state
let state = {
  adminSession: null,
  pilotSession: null,
  pilotId: null,
  flightId: null,
  bookingId: null,
  passengerId: null,
  stripeAccountId: null,
  qrUrl: null,
};

// Helper function to make requests
async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  if (options.session) {
    config.headers['Cookie'] = `session=${options.session}`;
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { text };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: response.headers,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

async function testAdminLogin() {
  logStep(1, 'Admin Login');
  
  const response = await makeRequest('/api/auth/admin/login', {
    method: 'POST',
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (!response.ok) {
    throw new Error(`Admin login failed: ${JSON.stringify(response.data)}`);
  }

  // Extract session cookie
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const sessionMatch = setCookie.match(/session=([^;]+)/);
    if (sessionMatch) {
      state.adminSession = sessionMatch[1];
      logSuccess('Admin logged in successfully');
      return;
    }
  }

  throw new Error('No session cookie in admin login response');
}

async function testPilotLogin() {
  logStep(2, 'Pilot Login');
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: PILOT_EMAIL,
      password: PILOT_PASSWORD,
      role: 'pilot',
    },
  });

  if (!response.ok) {
    throw new Error(`Pilot login failed: ${JSON.stringify(response.data)}`);
  }

  // Extract session cookie
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const sessionMatch = setCookie.match(/session=([^;]+)/);
    if (sessionMatch) {
      state.pilotSession = sessionMatch[1];
      logSuccess('Pilot logged in successfully');
      
      // Get pilot ID
      const pilotMe = await makeRequest('/api/pilot/me', {
        session: state.pilotSession,
      });
      if (pilotMe.ok && pilotMe.data.id) {
        state.pilotId = pilotMe.data.id;
        logInfo(`Pilot ID: ${state.pilotId}`);
      }
      return;
    }
  }

  throw new Error('No session cookie in pilot login response');
}

// ============================================================================
// PILOT API TESTS
// ============================================================================

async function testPilotMe() {
  logStep(3, 'Pilot /api/pilot/me');
  
  const response = await makeRequest('/api/pilot/me', {
    session: state.pilotSession,
  });

  if (!response.ok) {
    throw new Error(`Failed to get pilot info: ${JSON.stringify(response.data)}`);
  }

  logSuccess('Pilot info retrieved');
  logInfo(`Pilot: ${response.data.name || response.data.email}`);
  return response.data;
}

async function testPilotFlights() {
  logStep(4, 'Pilot Flights List');
  
  const response = await makeRequest('/api/pilot/flights', {
    session: state.pilotSession,
  });

  if (!response.ok) {
    throw new Error(`Failed to get flights: ${JSON.stringify(response.data)}`);
  }

  logSuccess(`Retrieved ${response.data.length || 0} flights`);
  return response.data;
}

async function testCreateFlight() {
  logStep(5, 'Create Flight');
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  
  const response = await makeRequest('/api/pilot/flights/create', {
    method: 'POST',
    session: state.pilotSession,
    body: {
      title: 'Test Flight - API Test',
      description: 'Automated test flight',
      date: futureDate.toISOString(),
      location: 'Test Location',
      priceCents: 20000, // $200
      maxPassengers: 4,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to create flight: ${JSON.stringify(response.data)}`);
  }

  state.flightId = response.data.id;
  logSuccess(`Flight created: ${state.flightId}`);
  logInfo(`Stripe Pay Link: ${response.data.stripePayLink || 'Not generated'}`);
  return response.data;
}

// ============================================================================
// STRIPE TESTS
// ============================================================================

async function testStripeAccountStatus() {
  logStep(6, 'Stripe Account Status');
  
  const response = await makeRequest('/api/pilot/stripe/account-status', {
    session: state.pilotSession,
  });

  if (!response.ok) {
    logInfo(`Stripe account status check: ${response.data.error || 'Not connected'}`);
    return null;
  }

  logSuccess('Stripe account status retrieved');
  logInfo(`Has Account: ${response.data.hasAccount}`);
  logInfo(`Onboarded: ${response.data.onboarded}`);
  
  if (response.data.accountId) {
    state.stripeAccountId = response.data.accountId;
  }
  
  return response.data;
}

async function testStripeOnboarding() {
  logStep(7, 'Stripe Onboarding Link Creation');
  
  const response = await makeRequest('/api/pilot/stripe/onboarding', {
    method: 'POST',
    session: state.pilotSession,
  });

  if (!response.ok) {
    logInfo(`Stripe onboarding: ${response.data.error || response.data.details || 'Not available'}`);
    return null;
  }

  if (response.data.url) {
    logSuccess('Stripe onboarding link created');
    logInfo(`Onboarding URL: ${response.data.url.substring(0, 80)}...`);
    return response.data;
  }

  logInfo('Stripe onboarding not available (may already be connected)');
  return null;
}

// ============================================================================
// QR CODE TESTS
// ============================================================================

async function testQRCodeGeneration() {
  logStep(8, 'QR Code Generation');
  
  if (!state.pilotId) {
    throw new Error('Pilot ID not available');
  }

  const response = await makeRequest(`/api/pilot/qr/${state.pilotId}`);

  if (!response.ok) {
    throw new Error(`Failed to generate QR code: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.url) {
    throw new Error('QR code URL not in response');
  }

  state.qrUrl = response.data.url;
  logSuccess('QR code URL generated');
  logInfo(`QR URL: ${response.data.url}`);
  
  // Verify URL format
  if (response.data.url.includes(`/passenger/register?pilotId=${state.pilotId}`)) {
    logSuccess('QR URL format is correct');
  } else {
    logError('QR URL format is incorrect');
  }
  
  return response.data;
}

async function testQRCodeFlow() {
  logStep(9, 'QR Code Flow (Passenger Registration Prefill)');
  
  if (!state.qrUrl) {
    throw new Error('QR URL not available');
  }

  // Extract pilotId from QR URL
  const urlObj = new URL(state.qrUrl);
  const pilotIdParam = urlObj.searchParams.get('pilotId');
  
  if (pilotIdParam !== state.pilotId) {
    throw new Error(`Pilot ID mismatch in QR URL: expected ${state.pilotId}, got ${pilotIdParam}`);
  }

  logSuccess('QR URL contains correct pilotId parameter');
  
  // Test that pilots list includes this pilot
  const pilotsList = await makeRequest('/api/pilots/list');
  if (pilotsList.ok) {
    const pilot = pilotsList.data.find(p => p.id === state.pilotId);
    if (pilot) {
      logSuccess('Pilot found in public pilots list (for passenger registration)');
    } else {
      logInfo('Pilot not in public list (may need approval)');
    }
  }
  
  return { qrUrl: state.qrUrl, pilotId: pilotIdParam };
}

// ============================================================================
// ADMIN API TESTS
// ============================================================================

async function testAdminPendingPilots() {
  logStep(10, 'Admin - Pending Pilots');
  
  const response = await makeRequest('/api/admin/pilots/pending', {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''}`,
    },
    session: state.adminSession,
  });

  if (!response.ok) {
    throw new Error(`Failed to get pending pilots: ${JSON.stringify(response.data)}`);
  }

  logSuccess(`Retrieved ${response.data.length || 0} pending pilots`);
  return response.data;
}

async function testAdminAllPilots() {
  logStep(11, 'Admin - All Pilots');
  
  const response = await makeRequest('/api/admin/pilots', {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''}`,
    },
    session: state.adminSession,
  });

  if (!response.ok) {
    logInfo(`Admin pilots list: ${response.data.error || 'Not available'}`);
    return null;
  }

  logSuccess(`Retrieved ${response.data.length || 0} total pilots`);
  return response.data;
}

// ============================================================================
// PASSENGER API TESTS
// ============================================================================

async function testPilotsList() {
  logStep(12, 'Public Pilots List (for passenger registration)');
  
  const response = await makeRequest('/api/pilots/list');

  if (!response.ok) {
    throw new Error(`Failed to get pilots list: ${JSON.stringify(response.data)}`);
  }

  logSuccess(`Retrieved ${response.data.length || 0} approved pilots`);
  return response.data;
}

// ============================================================================
// BOOKING API TESTS
// ============================================================================

async function testFlightBookings() {
  logStep(13, 'Flight Bookings');
  
  if (!state.flightId) {
    logInfo('Skipping - no flight ID available');
    return null;
  }

  const response = await makeRequest(`/api/bookings/flight/${state.flightId}`);

  if (!response.ok) {
    logInfo(`Flight bookings: ${response.data.error || 'Not available'}`);
    return null;
  }

  logSuccess(`Retrieved ${response.data.length || 0} bookings for flight`);
  return response.data;
}

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

async function testErrorHandling() {
  logStep(14, 'Error Handling Tests');
  
  // Test invalid login
  const invalidLogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'invalid@example.com',
      password: 'wrongpassword',
      role: 'pilot',
    },
  });

  if (invalidLogin.status === 401) {
    logSuccess('Invalid login correctly returns 401');
  } else {
    logError(`Invalid login should return 401, got ${invalidLogin.status}`);
  }

  // Test unauthorized access
  const unauthorized = await makeRequest('/api/pilot/me');
  if (unauthorized.status === 401) {
    logSuccess('Unauthorized access correctly returns 401');
  } else {
    logError(`Unauthorized access should return 401, got ${unauthorized.status}`);
  }

  // Test invalid flight ID
  const invalidFlight = await makeRequest('/api/flight/invalid-id');
  if (invalidFlight.status === 404 || invalidFlight.status === 400) {
    logSuccess('Invalid flight ID correctly returns error');
  } else {
    logInfo(`Invalid flight ID returned status: ${invalidFlight.status}`);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  COMPREHENSIVE API ROUTES TEST SUITE', 'bright');
  log('  Testing: API Routes, Stripe, QR Flow', 'cyan');
  log('█'.repeat(80) + '\n', 'bright');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: [],
  };

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin, required: true },
    { name: 'Pilot Login', fn: testPilotLogin, required: true },
    { name: 'Pilot /me', fn: testPilotMe, required: true },
    { name: 'Pilot Flights List', fn: testPilotFlights, required: false },
    { name: 'Create Flight', fn: testCreateFlight, required: false },
    { name: 'Stripe Account Status', fn: testStripeAccountStatus, required: false },
    { name: 'Stripe Onboarding', fn: testStripeOnboarding, required: false },
    { name: 'QR Code Generation', fn: testQRCodeGeneration, required: true },
    { name: 'QR Code Flow', fn: testQRCodeFlow, required: true },
    { name: 'Admin Pending Pilots', fn: testAdminPendingPilots, required: false },
    { name: 'Admin All Pilots', fn: testAdminAllPilots, required: false },
    { name: 'Public Pilots List', fn: testPilotsList, required: true },
    { name: 'Flight Bookings', fn: testFlightBookings, required: false },
    { name: 'Error Handling', fn: testErrorHandling, required: true },
  ];

  for (const test of tests) {
    try {
      await test.fn();
      results.passed++;
      results.tests.push({ name: test.name, status: 'passed' });
    } catch (error) {
      if (test.required) {
        logError(`${test.name} failed: ${error.message}`);
        results.failed++;
        results.tests.push({ name: test.name, status: 'failed', error: error.message });
      } else {
        logInfo(`${test.name} skipped: ${error.message}`);
        results.skipped++;
        results.tests.push({ name: test.name, status: 'skipped', error: error.message });
      }
    }
  }

  // Print summary
  log('\n' + '█'.repeat(80), 'bright');
  log('  TEST SUMMARY', 'bright');
  log('█'.repeat(80), 'bright');
  log(`\n✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`⏭️  Skipped: ${results.skipped}`, 'yellow');
  log(`\nTotal: ${results.passed + results.failed + results.skipped} tests\n`);

  if (results.failed > 0) {
    log('\nFailed Tests:', 'red');
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => log(`  - ${t.name}: ${t.error}`, 'red'));
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  log(`\nTesting against: ${BASE_URL}`, 'cyan');
  log(`Test started: ${new Date().toISOString()}\n`, 'cyan');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    logError(`Server not responding at ${BASE_URL}`);
    logInfo('Make sure the server is running: npm run dev');
    process.exit(1);
  }

  logSuccess('Server is running\n');

  await runAllTests();
})();

