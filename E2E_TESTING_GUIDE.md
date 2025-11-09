# End-to-End Testing Guide

## Overview

The E2E test validates the complete FlyingHotAir platform flow from pilot registration to passenger booking.

## What the Test Covers

### ✅ Complete Flow Testing

1. **Pilot Registration**
   - Creates a test pilot account with all required credentials
   - Validates registration API response

2. **Admin Approval**
   - Logs in as admin (admin@flyinghotair.com)
   - Approves the newly registered pilot
   - Verifies approval status

3. **Pilot Login & QR Generation**
   - Authenticates pilot
   - Retrieves pilot's unique QR code
   - Validates QR code data structure

4. **Stripe Connection** (Simulated)
   - Documents Stripe Connect onboarding process
   - Notes: Actual Stripe testing requires manual steps

5. **Flight Creation**
   - Creates a test flight with pricing
   - Generates Stripe payment link automatically
   - Validates flight data and payment link

6. **Passenger Registration with SMS**
   - Registers passenger via QR code flow (pilotId prefill)
   - **Sends welcome SMS to 18048354858**
   - Validates passenger creation

7. **Flight Notification SMS**
   - Selects registered passenger
   - Compiles personalized SMS with flight details
   - **Sends notification SMS to 18048354858**
   - Includes custom message and Stripe payment link

8. **Passenger Booking via Pay Link**
   - Provides Stripe payment link
   - Documents manual testing steps
   - Test card details provided for Stripe checkout

9. **Flight Management**
   - Retrieves flight details
   - Lists registered passengers
   - Validates QR check-in flow

## Prerequisites

### 1. Environment Variables

Ensure `.env.local` contains:

```bash
# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Twilio (REQUIRED for SMS testing)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
```

### 2. Database Setup

```bash
# Run migrations
pnpm prisma:migrate:deploy

# Seed admin account
pnpm seed
```

### 3. Dev Server Running

```bash
# In one terminal
pnpm dev

# Wait for server to start on http://localhost:3000
```

## Running the Test

### Quick Start

```bash
pnpm test:e2e
```

### What You'll See

The test will output colored, step-by-step progress:

```
████████████████████████████████████████████████████████████████████████████████
  FLYINGHOTAIR E2E TEST SUITE
  Complete Platform Flow Validation
████████████████████████████████████████████████████████████████████████████████

================================================================================
STEP 1: Pilot Registration
================================================================================
ℹ Making POST request to: /api/pilot/register
✓ Request successful
✓ Pilot registered with ID: clxxx...
ℹ Pilot email: test-pilot-1699564800000@flyinghotair.com
ℹ Pilot is pending approval: true

================================================================================
STEP 2: Admin Approval of Pilot
================================================================================
...
```

## SMS Verification

### Expected SMS Messages

During the test, you should receive **2 SMS messages** at **18048354858**:

#### 1. Welcome Message (Step 6)
```
Welcome to FlyingHotAir, Test Passenger E2E! 🎈 
You've successfully registered with pilot Test Pilot E2E. 
We'll notify you when flights become available!
```

#### 2. Flight Notification (Step 7)
```
Hello Test Passenger E2E! 🎈

Test Pilot E2E has a hot air balloon flight available!

📍 E2E Test Flight - Sunrise Adventure
📅 [Date 7 days from now]
🗺️ Richmond, VA
💰 $150.00

This is a test flight notification. Looking forward to flying with you!

🎟️ Reserve your spot: https://buy.stripe.com/test_...
```

## Manual Steps Required

### 1. Verify SMS Delivery

- Check phone **18048354858** for both messages
- Confirm message content matches expected format
- Verify Stripe payment link is included

### 2. Test Stripe Payment (Optional)

If you want to complete the full booking:

1. Click the payment link from the SMS
2. Use Stripe test card:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any ZIP code (e.g., `12345`)
3. Complete checkout
4. Booking will be created automatically

### 3. Verify in Database

```bash
# Open Prisma Studio
pnpm prisma:studio

# Check these tables:
# - Pilot (new test pilot should exist, approved=true)
# - Passenger (new test passenger should exist)
# - Flight (new test flight with Stripe links)
# - Booking (if you completed payment, booking should exist)
```

## Test Data

The test creates timestamped data to avoid conflicts:

- **Pilot Email**: `test-pilot-{timestamp}@flyinghotair.com`
- **Passenger Email**: `test-passenger-{timestamp}@flyinghotair.com`
- **Passenger Phone**: `18048354858` (hardcoded for SMS testing)
- **Flight Title**: "E2E Test Flight - Sunrise Adventure"
- **Price**: $150.00

## Expected Output

### Success Case

```
================================================================================
  TEST SUMMARY
================================================================================

Total Duration: 8.45s

Passed: 9
  ✓ Pilot Registration
  ✓ Admin Approval
  ✓ Pilot Login & QR Generation
  ✓ Stripe Connection
  ✓ Flight Creation
  ✓ Passenger Registration (SMS sent)
  ✓ Flight Notification SMS
  ✓ Payment Link Generated
  ✓ Flight Management

================================================================================
  TEST DATA FOR MANUAL VERIFICATION
================================================================================

Pilot Email: test-pilot-1699564800000@flyinghotair.com
Pilot Password: TestPilot123!
Pilot ID: clxxx...

Passenger Email: test-passenger-1699564800000@flyinghotair.com
Passenger Phone: 18048354858
Passenger ID: clxxx...

Flight ID: clxxx...
Flight Title: E2E Test Flight - Sunrise Adventure
Stripe Pay Link: https://buy.stripe.com/test_...

================================================================================
  NEXT STEPS
================================================================================

1. Check phone 18048354858 for SMS messages:
   - Welcome message from passenger registration
   - Flight notification with payment link

2. Test payment flow manually:
   - Visit: https://buy.stripe.com/test_...
   - Use test card: 4242 4242 4242 4242

3. Verify in database:
   - Run: npx prisma studio
   - Check Pilot, Passenger, Flight, and Booking tables
```

## Troubleshooting

### SMS Not Received

**Check:**
1. Twilio environment variables are set correctly
2. Twilio account has credits
3. Phone number 18048354858 is verified in Twilio (if using trial account)
4. Check Twilio logs at https://console.twilio.com

**Fix:**
```bash
# Verify Twilio env vars
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_PHONE_NUMBER

# Check Twilio account status
# Visit: https://console.twilio.com/us1/monitor/logs/sms
```

### Database Connection Failed

**Check:**
```bash
# Test database connection
npx prisma db pull

# If fails, verify DATABASE_URL in .env.local
```

### Admin Login Failed

**Fix:**
```bash
# Re-run seed to create admin account
pnpm seed
```

### Port 3000 Already in Use

**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
# Then update NEXT_PUBLIC_BASE_URL in .env.local
```

## Cleanup

Test data persists in the database. To clean up:

```sql
-- Connect to your database and run:
DELETE FROM "Booking" WHERE passengerId IN (
  SELECT id FROM "Passenger" WHERE email LIKE 'test-passenger-%'
);

DELETE FROM "Flight" WHERE pilotId IN (
  SELECT id FROM "Pilot" WHERE email LIKE 'test-pilot-%'
);

DELETE FROM "Passenger" WHERE email LIKE 'test-passenger-%';
DELETE FROM "Pilot" WHERE email LIKE 'test-pilot-%';
```

Or via Prisma Studio:
1. Run `pnpm prisma:studio`
2. Navigate to each table
3. Delete test records manually

## CI/CD Integration

To run in CI/CD pipeline:

```yaml
# .github/workflows/e2e-test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm prisma:generate
      - run: pnpm build
      - run: pnpm start & # Start server in background
      - run: sleep 10 # Wait for server
      - run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          TWILIO_ACCOUNT_SID: ${{ secrets.TWILIO_ACCOUNT_SID }}
          TWILIO_AUTH_TOKEN: ${{ secrets.TWILIO_AUTH_TOKEN }}
          TWILIO_PHONE_NUMBER: ${{ secrets.TWILIO_PHONE_NUMBER }}
```

## Support

If you encounter issues:

1. Check the detailed error output from the test
2. Verify all environment variables
3. Check Twilio and Stripe dashboards for logs
4. Review database state in Prisma Studio
5. Ensure dev server is running before test

## Notes

- **SMS charges apply**: Each test run sends 2 SMS messages
- **Stripe test mode**: No real charges occur
- **Idempotent**: Test can be run multiple times safely
- **Timestamped data**: Each run creates unique test records
- **Manual payment**: Actual Stripe checkout must be tested manually
