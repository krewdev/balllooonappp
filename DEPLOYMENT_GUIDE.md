# Deployment Guide: flyinghotair.com

## Prerequisites
- [x] Domain: flyinghotair.com (you own this)
- [x] GitHub account
- [x] Vercel account (sign up at https://vercel.com)
- [ ] Production database (PostgreSQL recommended - see Database section)
- [ ] Production Stripe keys
- [ ] Production environment variables

---

## Step 1: Prepare Your Repository

1. **Push code to GitHub:**
   ```bash
   cd /Users/krewdev/balllooonappp
   git add .
   git commit -m "Ready for deployment to flyinghotair.com"
   git push origin main
   ```

---

## Step 2: Set Up Production Database

**⚠️ CRITICAL:** SQLite (current database) won't work on Vercel. You need PostgreSQL.

### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Name it: `flyinghotair-db`
4. Copy the connection string (starts with `postgres://`)
5. Use this as your `DATABASE_URL` in Vercel environment variables

### Option B: External PostgreSQL Provider

Choose one:
- **Neon** (https://neon.tech) - Free tier, excellent for production
- **Supabase** (https://supabase.com) - Free tier, includes auth
- **Railway** (https://railway.app) - Simple pricing
- **Amazon RDS** - Enterprise option

**After creating database:**
1. Get the connection string (format: `postgresql://user:pass@host:port/db`)
2. Add to Vercel environment variables as `DATABASE_URL`

---

## Step 3: Update Prisma for PostgreSQL

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Run migration locally (optional test):**
   ```bash
   # Set DATABASE_URL to your new PostgreSQL URL
   export DATABASE_URL="postgresql://..."
   npx prisma migrate dev --name switch_to_postgresql
   ```

---

## Step 4: Deploy to Vercel

### A. Import Project

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo: `krewdev/balllooonappp`
4. Click "Import"

### B. Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Framework Preset:** Next.js
- **Build Command:** `pnpm build` or `npm run build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `pnpm install` or `npm install`

### C. Add Environment Variables

In Vercel dashboard, add these environment variables:

**Required Variables:**
```bash
# Database
DATABASE_URL=postgresql://your-postgres-url

# Base URL
NEXT_PUBLIC_BASE_URL=https://flyinghotair.com

# Stripe (PRODUCTION KEYS!)
STRIPE_SECRET_KEY=sk_live_...  # Get from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Set up webhook in Step 5

# Twilio
TWILIO_ACCOUNT_SID=ACea2c1de55e2fedba56ab19b119b907e0
TWILIO_AUTH_TOKEN=e679ef2e1c48ffe96fd9c26f70f24860
TWILIO_FROM_NUMBER=+18339151290

# Admin Auth (CHANGE THESE!)
ADMIN_TOKEN=your-strong-random-token-here-min-32-chars
NEXT_PUBLIC_ADMIN_TOKEN=your-strong-random-token-here-min-32-chars

# QR Security (CHANGE THIS!)
QR_SIGNING_SECRET=your-strong-random-secret-min-32-chars
QR_MAX_AGE_SECONDS=86400

# Platform Fee
PLATFORM_FEE_BPS=500

# Environment
NODE_ENV=production
```

**Generate secure tokens:**
```bash
# Run these locally to generate secure random tokens
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### D. Deploy

Click **"Deploy"** - Vercel will:
1. Build your app
2. Run database migrations automatically (via `prisma generate`)
3. Deploy to a temporary URL (e.g., `balllooonappp.vercel.app`)

---

## Step 5: Connect Custom Domain

1. In Vercel dashboard → Your project → "Settings" → "Domains"
2. Add domain: `flyinghotair.com`
3. Vercel will show DNS records to add

### DNS Configuration

Add these records in your domain registrar (where you bought flyinghotair.com):

**For apex domain (flyinghotair.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Wait 5-60 minutes** for DNS propagation.

---

## Step 6: Set Up Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://flyinghotair.com/api/webhook`
4. **Select events:**
   - `checkout.session.completed`
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. **Reveal** the webhook signing secret (starts with `whsec_`)
7. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy your app in Vercel

---

## Step 7: Run Database Migrations

After first deployment, run migrations:

1. In Vercel dashboard → Your project → "Settings" → "Functions"
2. Or run locally:
   ```bash
   # Set DATABASE_URL to production
   export DATABASE_URL="your-production-postgres-url"
   npx prisma migrate deploy
   ```

---

## Step 8: Seed Production Database

```bash
# Set DATABASE_URL to production
export DATABASE_URL="your-production-postgres-url"
node scripts/seed.js
```

This creates the initial pilot account (pilot@example.com).

---

## Step 9: Test Your Site

Visit https://flyinghotair.com and test:
- [ ] Homepage loads
- [ ] Pilot registration works
- [ ] Pilot login works
- [ ] Admin can approve pilots
- [ ] Stripe onboarding works
- [ ] Flight creation works
- [ ] Passenger booking works
- [ ] SMS notifications work
- [ ] QR code generation works

---

## Step 10: SSL Certificate

Vercel automatically provisions SSL certificates for:
- flyinghotair.com
- www.flyinghotair.com

Check for the 🔒 lock icon in browser.

---

## Post-Deployment Checklist

- [ ] Update NEXT_PUBLIC_BASE_URL to production URL
- [ ] Change all dev tokens to strong production values
- [ ] Use Stripe LIVE keys (not test keys)
- [ ] Set up Stripe webhook with production URL
- [ ] Configure production database
- [ ] Test all critical user flows
- [ ] Set up monitoring (Vercel Analytics included)
- [ ] Configure error tracking (consider Sentry)
- [ ] Set up database backups
- [ ] Document admin credentials securely

---

## Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check for TypeScript errors

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- Run `npx prisma generate` locally first

**Stripe errors:**
- Verify using LIVE keys for production
- Check webhook secret matches dashboard
- Ensure webhook endpoint is accessible

**Domain not working:**
- Wait 1 hour for DNS propagation
- Check DNS records with: `nslookup flyinghotair.com`
- Verify domain is not pointed elsewhere

---

## Monitoring & Maintenance

1. **Vercel Analytics:** Automatically enabled (view in dashboard)
2. **Error Logs:** Vercel dashboard → Runtime Logs
3. **Database Backups:** Set up with your database provider
4. **Uptime Monitoring:** Consider services like UptimeRobot

---

## Quick Commands Reference

```bash
# Push code
git push origin main

# View logs
vercel logs

# Force redeploy
vercel --prod

# Run migrations
npx prisma migrate deploy
```

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Stripe Docs: https://stripe.com/docs
- Your repo: https://github.com/krewdev/balllooonappp
