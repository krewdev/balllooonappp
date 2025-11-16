# Stripe Webhook Setup Guide

## Production Setup

### 1. Create Webhook Endpoint in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/api/webhook`
   - Replace `yourdomain.com` with your actual production domain
   - Example: `https://flyinghotair.com/api/webhook`
4. **Description:** "Flying Hot Air - Payment & Subscription Events"

### 2. Select Events to Listen To

Select these events (check the boxes):

**Required Events:**
- ✅ `checkout.session.completed` - Marks bookings as paid
- ✅ `invoice.payment_failed` - Logs payment failures

**Optional Events (currently logged only, not fully implemented):**
- ⚠️ `customer.subscription.updated` - For future subscription management
- ⚠️ `customer.subscription.deleted` - For future subscription cancellations

### 3. Get Webhook Secret

1. After creating the endpoint, click on it
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Test the Webhook

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select event: `checkout.session.completed`
4. Check your application logs to verify it's received

---

## Development Setup (Local Testing)

### Option 1: Stripe CLI (Recommended)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_...`)
5. Add to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Option 2: Test Webhook in Stripe Dashboard

1. Create a test endpoint in Stripe Dashboard
2. Use Stripe's webhook testing tool
3. Note: You'll need to expose your local server (use ngrok or similar)

---

## Environment Variables

Add to **Vercel** (Production):
```
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

Add to **.env.local** (Development):
```
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
```

---

## Current Webhook Handler Capabilities

Your webhook handler (`app/api/webhook/route.ts`) currently:

✅ **Fully Implemented:**
- `checkout.session.completed` - Updates booking status to "confirmed" and sets `paid: true`

⚠️ **Partially Implemented (logged only):**
- `customer.subscription.updated` - Logs subscription updates
- `customer.subscription.deleted` - Logs subscription cancellations
- `invoice.payment_failed` - Logs payment failures

**Future Enhancements Needed:**
- Update pilot subscription status in database
- Send notifications for payment failures
- Handle meister payment status updates

---

## Verification

After setting up, test by:

1. **Create a test booking** in your app
2. **Complete payment** via Stripe Checkout
3. **Check your database** - booking should have `paid: true` and `status: "confirmed"`
4. **Check application logs** - should see webhook event logged

---

## Troubleshooting

### Webhook not receiving events?
- ✅ Verify webhook URL is correct (must be HTTPS in production)
- ✅ Check `STRIPE_WEBHOOK_SECRET` is set correctly
- ✅ Verify events are selected in Stripe Dashboard
- ✅ Check Vercel function logs for errors

### Signature verification failed?
- ✅ Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- ✅ Make sure you're using the correct secret (test vs. live mode)

### Events not being processed?
- ✅ Check application logs for webhook handler errors
- ✅ Verify the event type is in the switch statement
- ✅ Check database connection is working

