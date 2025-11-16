# 🧪 Manual Testing Guide - Complete User Flow

This guide walks you through testing the entire FlyingHotAir platform as a human would, step by step.

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   Server should be running at `http://localhost:3000`

2. **Ensure database is set up:**
   ```bash
   npm run prisma:migrate:deploy
   ```

3. **Seed admin account (if not already done):**
   ```bash
   npm run seed
   ```
   Admin credentials:
   - Email: `admin@flyinghotair.com`
   - Password: `adminpass`

---

## Complete User Flow Test

### Step 1: Pilot Registration 👨‍✈️

**As a new pilot discovering the platform:**

1. Navigate to: `http://localhost:3000/pilot/register`
2. Fill out the 4-step registration form:
   - **Step 1 (Account):**
     - Email: `test-pilot-${Date.now()}@example.com` (use unique email)
     - Password: `PilotTest123!` (must meet complexity requirements)
     - Confirm Password: `PilotTest123!`
   - **Step 2 (Personal Info):**
     - Full Name: `John Pilot`
     - Phone: `+14155551234`
     - Weight: `180` lbs
   - **Step 3 (License & Certification):**
     - License Number: `LIC-12345`
     - License Expiry: Select a future date
     - Years Experience: `10`
     - Total Flight Hours: `1000`
   - **Step 4 (Insurance & Balloon):**
     - Insurance Provider: `Test Insurance Co`
     - Insurance Policy Number: `POL-12345`
     - Insurance Expiry: Select a future date
     - Balloon Registration: `N-12345`
     - Balloon Capacity: `4`
3. Click "Submit Registration"
4. **Expected Result:** 
   - ✅ Success message displayed
   - ✅ Redirected to login page or shown "pending approval" message
   - ✅ Pilot account created (but not yet approved)

**Verify in Database:**
```sql
SELECT id, email, fullName, approved FROM "Pilot" WHERE email = 'your-test-email@example.com';
-- approved should be false
```

---

### Step 2: Admin Approval 👨‍💼

**As an admin reviewing new pilot registrations:**

1. Navigate to: `http://localhost:3000/admin/login`
2. Login with admin credentials:
   - Email: `admin@flyinghotair.com`
   - Password: `adminpass`
3. Navigate to: `http://localhost:3000/admin/pilot-approvals`
4. **Expected Result:**
   - ✅ See the newly registered pilot in the pending list
   - ✅ See pilot's details (name, email, license info)
5. Click "Approve" button next to the pilot
6. **Expected Result:**
   - ✅ Pilot disappears from pending list
   - ✅ Pilot is now approved

**Verify in Database:**
```sql
SELECT id, email, approved FROM "Pilot" WHERE email = 'your-test-email@example.com';
-- approved should now be true
```

---

### Step 3: Pilot Login & Dashboard 🎯

**As the approved pilot:**

1. Navigate to: `http://localhost:3000/pilot/login`
2. Login with pilot credentials:
   - Email: `test-pilot-${timestamp}@example.com` (from Step 1)
   - Password: `PilotTest123!`
   - Role: `pilot`
3. **Expected Result:**
   - ✅ Successfully logged in
   - ✅ Redirected to `/pilot/dashboard`
4. On the dashboard, verify:
   - ✅ Profile information is displayed
   - ✅ Approval status shows as "Approved"
   - ✅ Stripe onboarding section (if not connected)
   - ✅ QR code download option

---

### Step 4: Stripe Onboarding 💳

**As the pilot setting up payments:**

1. On the pilot dashboard, find the "Stripe Account" section
2. Click "Connect Stripe Account" or "Complete Onboarding"
3. **Expected Result:**
   - ✅ Redirected to Stripe Connect onboarding (test mode)
   - ✅ Complete Stripe onboarding form
   - ✅ Redirected back to dashboard
   - ✅ Dashboard shows "Stripe Connected" status

**Note:** In test mode, use Stripe test credentials. In production, this would be live Stripe Connect.

---

### Step 5: Create Flight ✈️

**As the pilot creating a flight offering:**

1. Navigate to: `http://localhost:3000/pilot/flights/new`
2. Fill out the flight form:
   - Title: `Sunrise Adventure Flight`
   - Description: `Experience the beauty of sunrise from above`
   - Date: Select a date 7+ days in the future
   - Location: `Richmond, VA`
   - Price: `$200` (20000 cents)
   - Max Passengers: `2`
3. Click "Create Flight"
4. **Expected Result:**
   - ✅ Flight created successfully
   - ✅ Redirected to flight details page
   - ✅ Stripe payment link generated
   - ✅ Flight appears in pilot's flight list

**Verify:**
- Check `/pilot/flights` to see the new flight
- Verify Stripe pay link is generated

---

### Step 6: Generate QR Code 📱

**As the pilot sharing their QR code:**

1. On the pilot dashboard, find the QR code section
2. Click "Download QR Code" or view QR code
3. **Expected Result:**
   - ✅ QR code displayed/downloaded
   - ✅ QR code contains URL: `/passenger/register?pilotId={pilotId}`
4. **Test QR Code:**
   - Scan with phone (or manually visit the URL)
   - URL should be: `http://localhost:3000/passenger/register?pilotId={your-pilot-id}`

---

### Step 7: Passenger Registration via QR Code 👤

**As a passenger scanning the QR code:**

1. Visit the QR code URL (or navigate to `/passenger/register?pilotId={pilotId}`)
2. **Expected Result:**
   - ✅ Registration page loads
   - ✅ "Preferred Pilot" dropdown is pre-filled with pilot's name
   - ✅ Visual indicator shows: "✓ Pilot pre-selected from QR code: [Pilot Name]"
3. Fill out the registration form:
   - Full Name: `Jane Passenger`
   - Email: `test-passenger-${Date.now()}@example.com`
   - Password: `PassengerTest123!`
   - Weight: `150` lbs
   - Phone: `+14155555678`
   - ZIP Code: `23220`
   - Preferred Pilot: Should already be selected
4. Click "Create Account"
5. **Expected Result:**
   - ✅ Registration successful
   - ✅ Redirected to SMS consent page
   - ✅ Welcome SMS sent (if Twilio configured)

**Verify:**
- Check phone for welcome SMS (if Twilio is configured)
- Passenger record created in database

---

### Step 8: Passenger Login & Dashboard 🎫

**As the registered passenger:**

1. Navigate to: `http://localhost:3000/passenger/login`
2. Login with passenger credentials:
   - Email: `test-passenger-${timestamp}@example.com`
   - Password: `PassengerTest123!`
   - Role: `passenger`
3. **Expected Result:**
   - ✅ Successfully logged in
   - ✅ Redirected to `/passenger/dashboard`
4. On dashboard, verify:
   - ✅ Profile information displayed
   - ✅ No bookings yet (empty state)

---

### Step 9: Book Flight 📅

**As the passenger booking the flight:**

1. Navigate to: `http://localhost:3000/passenger/book/{flightId}`
   - Replace `{flightId}` with the flight ID from Step 5
2. **Expected Result:**
   - ✅ Flight details displayed
   - ✅ Price, date, location shown
   - ✅ "Book Flight" button available
3. Click "Book Flight"
4. **Expected Result:**
   - ✅ Booking created
   - ✅ Redirected to payment page or Stripe checkout

---

### Step 10: Payment 💰

**As the passenger paying for the flight:**

1. On the payment/checkout page:
   - If using Stripe test mode, use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
2. Complete payment
3. **Expected Result:**
   - ✅ Payment processed successfully
   - ✅ Redirected to success page
   - ✅ Booking status updated to "confirmed" and "paid: true"

**Verify in Database:**
```sql
SELECT id, flightId, passengerId, status, paid FROM "Booking" WHERE flightId = '{flightId}';
-- status should be 'confirmed', paid should be true
```

---

### Step 11: Pilot Views Bookings 👀

**As the pilot checking bookings:**

1. Navigate to: `http://localhost:3000/pilot/flights/{flightId}`
2. **Expected Result:**
   - ✅ Flight details displayed
   - ✅ Booking count: "1 / 2" (or similar)
   - ✅ Passenger name and email listed
   - ✅ Booking status shown as "confirmed"

---

### Step 12: Passenger Checks Flight Status 🎯

**As the passenger checking their flight:**

1. Navigate to: `http://localhost:3000/flight/{flightId}/status`
2. Enter verification details:
   - Last Name: `Passenger` (from full name)
   - Phone: `+14155555678`
3. Click "Verify Access"
4. **Expected Result:**
   - ✅ Flight details displayed
   - ✅ Booking information shown
   - ✅ Status: "confirmed"
   - ✅ Payment status: "paid"

---

### Step 13: SMS Notification 📲

**As the pilot notifying passengers:**

1. Navigate to: `http://localhost:3000/pilot/flights/{flightId}`
2. Find the "Notify Passengers" section
3. Select passengers to notify
4. Optionally add a custom message
5. Click "Send Notifications"
6. **Expected Result:**
   - ✅ SMS sent to selected passengers
   - ✅ Success message displayed
   - ✅ Passengers receive SMS with flight details and booking link

**Verify:**
- Check passenger's phone for SMS (if Twilio configured)
- SMS should include flight details and payment link

---

## Testing Checklist

Use this checklist to verify all features:

- [ ] Pilot can register with all required fields
- [ ] Password complexity requirements enforced
- [ ] Pilot registration requires admin approval
- [ ] Admin can view pending pilots
- [ ] Admin can approve pilots
- [ ] Approved pilot can log in
- [ ] Pilot can complete Stripe onboarding
- [ ] Pilot can create flights
- [ ] Flight creation generates Stripe payment link
- [ ] Pilot can generate/download QR code
- [ ] QR code URL contains correct pilotId
- [ ] Passenger registration page pre-fills pilot from QR code
- [ ] Passenger can register with all required fields
- [ ] Welcome SMS sent (if Twilio configured)
- [ ] Passenger can log in
- [ ] Passenger can view available flights
- [ ] Passenger can book a flight
- [ ] Booking creates passenger record if needed
- [ ] Payment flow works with Stripe
- [ ] Booking status updates after payment
- [ ] Pilot can view bookings for their flights
- [ ] Passenger can verify flight access with phone/last name
- [ ] SMS notifications can be sent to passengers
- [ ] Rate limiting works (try multiple rapid requests)
- [ ] Input validation works (try invalid emails, weak passwords)
- [ ] Error boundaries catch and display errors gracefully

---

## Common Issues & Solutions

### Issue: "Pilot not found in pending list"
**Solution:** Check that pilot was created with `approved: false` in database

### Issue: "Cannot login after approval"
**Solution:** Verify session cookies are working, try clearing cookies and logging in again

### Issue: "Stripe onboarding fails"
**Solution:** Ensure Stripe test keys are configured in `.env.local`

### Issue: "SMS not sending"
**Solution:** Check Twilio credentials in `.env.local`, verify phone number format

### Issue: "Payment not processing"
**Solution:** Use Stripe test card numbers, verify webhook endpoint is configured

### Issue: "QR code not working"
**Solution:** Verify `NEXT_PUBLIC_BASE_URL` is set correctly in environment variables

---

## Automated Testing

For automated testing, run:

```bash
npm run test:flow
```

This will test the complete flow programmatically. Make sure the server is running first:

```bash
npm run dev
```

Then in another terminal:

```bash
npm run test:flow
```

---

## Next Steps

After completing manual testing:

1. ✅ Verify all checklist items pass
2. ✅ Test error scenarios (invalid inputs, failed payments, etc.)
3. ✅ Test edge cases (multiple bookings, full flights, etc.)
4. ✅ Test on different browsers
5. ✅ Test on mobile devices
6. ✅ Test with real Stripe test mode
7. ✅ Test SMS delivery with real phone numbers

---

## Notes

- All test data should use unique emails (use timestamps)
- Use Stripe test mode for payment testing
- SMS testing requires valid Twilio credentials
- Database should be reset between full test runs (or use unique test data)
- Rate limiting may affect rapid testing - wait between requests if needed

