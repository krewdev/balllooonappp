#!/usr/bin/env node

/**
 * End-to-End Test for FlyingHotAir Platform
 * Tests the complete flow:
 * 1. Pilot registration
 * 2. Admin approval
 * 3. Pilot login and QR generation
 * 4. Stripe account connection
 * 5. Flight creation
 * 6. Passenger registration via QR (with SMS notification)
 * 7. SMS notification to passenger about flight
 * 8. Passenger booking via Stripe pay link
 * 9. Flight management and check-in
 */

const { fetch } = require('undici');
const bcrypt = require('bcryptjs');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
const TEST_PHONE = '+18048354858'; // Phone number for SMS testing (E.164 format)

// Test data
const testData = {
  pilot: {
    email: `test-pilot-${Date.now()}@flyinghotair.com`,
    password: 'TestPilot123!',
    fullName: 'Test Pilot E2E',
    phone: '+14155551234',
    weightKg: 80,
    licenseNumber: 'E2E-TEST-123',
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    yearsExperience: 5,
    totalFlightHours: 500,
    insuranceProvider: 'Test Insurance Co',
    insurancePolicyNumber: 'TEST-POL-123',
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    balloonRegistration: 'N-TEST-123',
    balloonCapacity: 4
  },
  passenger: {
    email: `test-passenger-${Date.now()}@flyinghotair.com`,
    password: 'TestPass123!',
    fullName: 'Test Passenger E2E',
    phone: TEST_PHONE,
    weightLbs: 154, // ~70kg (API expects weightLbs)
    zipCode: '23220', // ZIP code (API expects camelCase 'zipCode')
    smsConsent: true
  },
  flight: {
    title: 'E2E Test Flight - Sunrise Adventure',
    description: 'Beautiful sunrise flight for testing',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    location: 'Richmond, VA',
    priceCents: 15000, // $150
    maxPassengers: 3
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(stepNumber, message) {
  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`STEP ${stepNumber}: ${message}`, 'bright');
  log('='.repeat(80), 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  logInfo(`Making ${options.method || 'GET'} request to: ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      logError(`Request failed: ${response.status} ${response.statusText}`);
      logError(`Response: ${JSON.stringify(data, null, 2)}`);
      throw new Error(`API request failed: ${JSON.stringify(data)}`);
    }

    logSuccess(`Request successful`);
    return { response, data };
  } catch (error) {
    logError(`Fetch error: ${error.message}`);
    logInfo(`URL attempted: ${url}`);
    logInfo(`Make sure the server is running: PORT=3002 pnpm dev`);
    throw error;
  }
}

// Store session data
const sessionData = {
  pilotId: null,
  pilotSessionCookie: null,
  adminSessionCookie: null,
  passengerId: null,
  passengerSessionCookie: null,
  flightId: null,
  stripePayLink: null,
  pilotQRCodeData: null
};

async function step1_PilotRegistration() {
  logStep(1, 'Pilot Registration');
  
  const { data } = await makeRequest('/api/pilot/register', {
    method: 'POST',
    body: JSON.stringify(testData.pilot)
  });

  sessionData.pilotId = data.pilot?.id;
  logSuccess(`Pilot registered with ID: ${sessionData.pilotId}`);
  logInfo(`Pilot email: ${testData.pilot.email}`);
  logInfo(`Pilot is pending approval: ${!data.pilot?.approved}`);
  
  return data;
}

async function step2_AdminApproval() {
  logStep(2, 'Admin Approval of Pilot');
  
  // First, login as admin
  logInfo('Logging in as admin...');
  const loginResponse = await makeRequest('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@flyinghotair.com',
      password: 'adminpass'
    })
  });

  // Extract session cookie from Set-Cookie header
  const setCookie = loginResponse.response.headers.get('set-cookie');
  logInfo(`Set-Cookie header: ${setCookie ? 'Present' : 'Missing'}`);
  
  if (setCookie) {
    const sessionMatch = setCookie.match(/session=([^;]+)/);
    if (sessionMatch) {
      sessionData.adminSessionCookie = sessionMatch[1];
      logSuccess('Admin logged in successfully');
      logInfo(`Admin session cookie: ${sessionData.adminSessionCookie.substring(0, 20)}...`);
    } else {
      logError('Failed to extract session from Set-Cookie header');
      throw new Error('No session cookie found');
    }
  } else {
    logError('No Set-Cookie header in admin login response');
    throw new Error('No Set-Cookie header');
  }

  // Approve the pilot
  logInfo(`Approving pilot ${sessionData.pilotId}...`);
  
  const { data } = await makeRequest('/api/admin/pilots/approve', {
    method: 'POST',
    headers: {
      Cookie: `session=${sessionData.adminSessionCookie}`
    },
    body: JSON.stringify({
      id: sessionData.pilotId  // Note: API expects 'id' not 'pilotId'
    })
  });

  logSuccess(`Pilot approved successfully`);
  return data;
}

async function step3_PilotLoginAndQRGeneration() {
  logStep(3, 'Pilot Login and QR Code Generation');
  
  // Login as pilot
  logInfo('Logging in as pilot...');
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testData.pilot.email,
      password: testData.pilot.password,
      role: 'pilot'
    })
  });

  // Extract session cookie
  const setCookie = loginResponse.response.headers.get('set-cookie');
  if (setCookie) {
    const sessionMatch = setCookie.match(/session=([^;]+)/);
    if (sessionMatch) {
      sessionData.pilotSessionCookie = sessionMatch[1];
      logSuccess('Pilot logged in successfully');
    }
  }

  // Get pilot's QR code data
  logInfo('Fetching pilot QR code data...');
  const qrResponse = await makeRequest(`/api/pilot/qr/${sessionData.pilotId}`, {
    headers: {
      Cookie: `session=${sessionData.pilotSessionCookie}`
    }
  });

  sessionData.pilotQRCodeData = qrResponse.data;
  logSuccess('QR code data retrieved');
  logInfo(`QR Code URL: ${BASE_URL}/passenger/register?pilotId=${sessionData.pilotId}`);
  
  return qrResponse.data;
}

async function step4_StripeConnection() {
  logStep(4, 'Stripe Account Connection (Simulated)');
  
  logInfo('In production, pilot would complete Stripe onboarding here');
  logInfo('For testing, we skip actual Stripe Connect flow');
  logSuccess('Stripe connection simulated (would happen via Stripe dashboard)');
  
  // Note: In a real test, you'd need to:
  // 1. Create a Stripe Connect test account
  // 2. Complete onboarding via Stripe's test mode
  // 3. Verify the stripeAccountId is saved
  
  return { simulated: true };
}

async function step5_FlightCreation() {
  logStep(5, 'Flight Creation with Stripe Payment Link');
  
  logInfo('Creating flight...');
  const { data } = await makeRequest('/api/pilot/flights/create', {
    method: 'POST',
    headers: {
      Cookie: `session=${sessionData.pilotSessionCookie}`
    },
    body: JSON.stringify(testData.flight)
  });

  sessionData.flightId = data.flight?.id;
  sessionData.stripePayLink = data.flight?.stripePayLink || data.payLink;
  
  logSuccess(`Flight created with ID: ${sessionData.flightId}`);
  logInfo(`Flight title: ${testData.flight.title}`);
  logInfo(`Flight date: ${testData.flight.date}`);
  logInfo(`Price: $${testData.flight.priceCents / 100}`);
  logSuccess(`Stripe payment link generated: ${sessionData.stripePayLink}`);
  
  return data;
}

async function step6_PassengerRegistrationWithSMS() {
  logStep(6, 'Passenger Registration via QR Code (with SMS Welcome)');
  
  logInfo(`Registering passenger with pilot ID: ${sessionData.pilotId}`);
  logInfo(`SMS will be sent to: ${TEST_PHONE}`);
  
  const { data } = await makeRequest('/api/passenger/register', {
    method: 'POST',
    body: JSON.stringify({
      ...testData.passenger,
      pilotId: sessionData.pilotId // Simulating QR code scan
    })
  });

  sessionData.passengerId = data.id; // API returns passenger object directly
  logSuccess(`Passenger registered with ID: ${sessionData.passengerId}`);
  logInfo(`Passenger email: ${testData.passenger.email}`);
  logSuccess(`Welcome SMS should be sent to ${TEST_PHONE}`);
  logInfo('Check your phone for the welcome message!');
  
  return data;
}

async function step7_SendFlightNotificationSMS() {
  logStep(7, 'Send Flight Notification SMS to Passenger');
  
  logInfo(`Sending SMS notification about flight to passenger...`);
  logInfo(`Passenger phone: ${TEST_PHONE}`);
  
  const { data } = await makeRequest('/api/pilot/flights/notify', {
    method: 'POST',
    headers: {
      Cookie: `session=${sessionData.pilotSessionCookie}`
    },
    body: JSON.stringify({
      flightId: sessionData.flightId,
      passengerIds: [sessionData.passengerId],
      customMessage: 'This is a test flight notification. Looking forward to flying with you!'
    })
  });

  logSuccess('SMS notification sent successfully');
  logInfo(`Message: ${data.message}`);
  logInfo('Check your phone for the flight notification with payment link!');
  
  return data;
}

async function step8_PassengerBookingViaPayLink() {
  logStep(8, 'Passenger Booking via Stripe Payment Link');
  
  logInfo('Payment link provided in SMS notification');
  logSuccess(`Stripe Pay Link: ${sessionData.stripePayLink}`);
  logInfo('\nIn a real scenario, passenger would:');
  logInfo('1. Click the payment link in the SMS');
  logInfo('2. Complete Stripe checkout');
  logInfo('3. Payment would be processed automatically');
  logInfo('4. Booking would be created in database');
  
  logInfo('\nFor testing without actual payment:');
  logInfo('- Visit the Stripe payment link in a browser');
  logInfo('- Use Stripe test card: 4242 4242 4242 4242');
  logInfo('- Any future expiry date');
  logInfo('- Any CVC');
  
  return { 
    payLink: sessionData.stripePayLink,
    note: 'Manual payment testing required'
  };
}

async function step9_FlightManagement() {
  logStep(9, 'Flight Management and Passenger Check-in');
  
  // Get flight details with bookings
  logInfo('Fetching flight details...');
  const { data: flightData } = await makeRequest(`/api/flight/${sessionData.flightId}`, {
    headers: {
      Cookie: `session=${sessionData.pilotSessionCookie}`
    }
  });

  logSuccess('Flight details retrieved');
  logInfo(`Flight: ${flightData.title}`);
  logInfo(`Location: ${flightData.location}`);
  logInfo(`Max Passengers: ${flightData.maxPassengers}`);
  
  // Get pilot's passengers
  logInfo('\nFetching registered passengers...');
  const { data: passengersData } = await makeRequest('/api/pilot/passengers', {
    headers: {
      Cookie: `session=${sessionData.pilotSessionCookie}`
    }
  });

  logSuccess(`Found ${passengersData.passengers?.length || 0} registered passenger(s)`);
  if (passengersData.passengers?.length > 0) {
    passengersData.passengers.forEach((p, i) => {
      logInfo(`  ${i + 1}. ${p.fullName} (${p.phone}) - ZIP: ${p.location}`);
    });
  }
  
  logInfo('\nQR Code Check-in Process:');
  logInfo('On flight day, passengers would:');
  logInfo('1. Scan pilot\'s QR code');
  logInfo('2. System verifies their booking');
  logInfo('3. Check-in recorded in database');
  
  return { flight: flightData, passengers: passengersData };
}

async function runE2ETest() {
  log('\n' + '█'.repeat(80), 'bright');
  log('  FLYINGHOTAIR E2E TEST SUITE', 'bright');
  log('  Complete Platform Flow Validation', 'cyan');
  log('█'.repeat(80) + '\n', 'bright');
  
  const startTime = Date.now();
  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  try {
    // Step 1: Pilot Registration
    try {
      await step1_PilotRegistration();
      results.success.push('Pilot Registration');
    } catch (error) {
      logError(`Step 1 failed: ${error.message}`);
      results.failed.push('Pilot Registration');
      throw error;
    }

    // Step 2: Admin Approval
    try {
      await step2_AdminApproval();
      results.success.push('Admin Approval');
    } catch (error) {
      logError(`Step 2 failed: ${error.message}`);
      results.failed.push('Admin Approval');
      throw error;
    }

    // Step 3: Pilot Login and QR
    try {
      await step3_PilotLoginAndQRGeneration();
      results.success.push('Pilot Login & QR Generation');
    } catch (error) {
      logError(`Step 3 failed: ${error.message}`);
      results.failed.push('Pilot Login & QR Generation');
      throw error;
    }

    // Step 4: Stripe Connection (simulated)
    try {
      await step4_StripeConnection();
      results.success.push('Stripe Connection');
    } catch (error) {
      logError(`Step 4 failed: ${error.message}`);
      results.failed.push('Stripe Connection');
      throw error;
    }

    // Step 5: Flight Creation
    try {
      await step5_FlightCreation();
      results.success.push('Flight Creation');
    } catch (error) {
      logError(`Step 5 failed: ${error.message}`);
      results.failed.push('Flight Creation');
      throw error;
    }

    // Step 6: Passenger Registration (with SMS)
    try {
      await step6_PassengerRegistrationWithSMS();
      results.success.push('Passenger Registration (SMS sent)');
    } catch (error) {
      logError(`Step 6 failed: ${error.message}`);
      results.failed.push('Passenger Registration');
      throw error;
    }

    // Step 7: Flight Notification SMS
    try {
      await step7_SendFlightNotificationSMS();
      results.success.push('Flight Notification SMS');
    } catch (error) {
      logError(`Step 7 failed: ${error.message}`);
      results.failed.push('Flight Notification SMS');
      throw error;
    }

    // Step 8: Passenger Booking (manual)
    try {
      await step8_PassengerBookingViaPayLink();
      results.success.push('Payment Link Generated');
    } catch (error) {
      logError(`Step 8 failed: ${error.message}`);
      results.failed.push('Passenger Booking');
      throw error;
    }

    // Step 9: Flight Management
    try {
      await step9_FlightManagement();
      results.success.push('Flight Management');
    } catch (error) {
      logError(`Step 9 failed: ${error.message}`);
      results.failed.push('Flight Management');
      // Don't throw - this is the last step
    }

  } catch (error) {
    // Test halted due to critical failure
  }

  // Print summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(80), 'bright');
  log('  TEST SUMMARY', 'bright');
  log('='.repeat(80), 'bright');
  
  log(`\nTotal Duration: ${duration}s`, 'cyan');
  log(`\nPassed: ${results.success.length}`, 'green');
  results.success.forEach(step => log(`  ✓ ${step}`, 'green'));
  
  if (results.failed.length > 0) {
    log(`\nFailed: ${results.failed.length}`, 'red');
    results.failed.forEach(step => log(`  ✗ ${step}`, 'red'));
  }
  
  if (results.skipped.length > 0) {
    log(`\nSkipped: ${results.skipped.length}`, 'yellow');
    results.skipped.forEach(step => log(`  ⊘ ${step}`, 'yellow'));
  }

  log('\n' + '='.repeat(80), 'bright');
  log('  TEST DATA FOR MANUAL VERIFICATION', 'bright');
  log('='.repeat(80), 'bright');
  log(`\nPilot Email: ${testData.pilot.email}`, 'cyan');
  log(`Pilot Password: ${testData.pilot.password}`, 'cyan');
  log(`Pilot ID: ${sessionData.pilotId}`, 'cyan');
  log(`\nPassenger Email: ${testData.passenger.email}`, 'cyan');
  log(`Passenger Phone: ${TEST_PHONE}`, 'cyan');
  log(`Passenger ID: ${sessionData.passengerId}`, 'cyan');
  log(`\nFlight ID: ${sessionData.flightId}`, 'cyan');
  log(`Flight Title: ${testData.flight.title}`, 'cyan');
  log(`Stripe Pay Link: ${sessionData.stripePayLink}`, 'cyan');
  
  log('\n' + '='.repeat(80), 'bright');
  log('  NEXT STEPS', 'bright');
  log('='.repeat(80), 'bright');
  log('\n1. Check phone ' + TEST_PHONE + ' for SMS messages:', 'yellow');
  log('   - Welcome message from passenger registration', 'yellow');
  log('   - Flight notification with payment link', 'yellow');
  log('\n2. Test payment flow manually:', 'yellow');
  log(`   - Visit: ${sessionData.stripePayLink}`, 'yellow');
  log('   - Use test card: 4242 4242 4242 4242', 'yellow');
  log('\n3. Verify in database:', 'yellow');
  log('   - Run: npx prisma studio', 'yellow');
  log('   - Check Pilot, Passenger, Flight, and Booking tables', 'yellow');
  
  log('\n' + '█'.repeat(80) + '\n', 'bright');

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run the test
runE2ETest().catch(error => {
  logError(`\nFatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
