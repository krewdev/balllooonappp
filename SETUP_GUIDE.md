# Complete Setup Guide: Environment Variables & Database

This guide walks you through:
1. **Setting up your local environment variables**
2. **Uploading them to Vercel (production)**
3. **Setting up and migrating your database with Prisma**

---

## Part 1: Local Environment Variables Setup

### Step 1.1: Create Local `.env` File

Create a `.env` file in your project root (if it doesn't exist):

```bash
cd /Users/krewdev/balllooonappp-2
touch .env
```

### Step 1.2: Add Required Environment Variables

Open `.env` and add these variables (use your actual values):

```bash
# Database (for local development - SQLite or PostgreSQL)
DATABASE_URL="file:./dev.db"  # For SQLite (local dev)
# OR for PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/flyinghotair"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Stripe (Test keys for development)
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Twilio
TWILIO_ACCOUNT_SID="ACea2c1de55e2fedba56ab19b119b907e0"
TWILIO_AUTH_TOKEN="e679ef2e1c48ffe96fd9c26f70f24860"
TWILIO_FROM_NUMBER="+18339151290"

# Admin Auth (Generate secure tokens - see below)
ADMIN_TOKEN="your-strong-random-token-here-min-32-chars"
NEXT_PUBLIC_ADMIN_TOKEN="your-strong-random-token-here-min-32-chars"

# QR Security
QR_SIGNING_SECRET="06feba9e93ad18634580a8eb85c3fadcad93f0d313b3b1e567a6aae9a9152765"
QR_MAX_AGE_SECONDS="86400"

# Platform Fee (in basis points, 500 = 5%)
PLATFORM_FEE_BPS="500"

# Node Environment
NODE_ENV="development"
```

### Step 1.3: Generate Secure Tokens (if needed)

If you need to generate secure random tokens:

```bash
# Generate a secure random token (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this multiple times to generate different tokens for `ADMIN_TOKEN` and `NEXT_PUBLIC_ADMIN_TOKEN`.

---

## Part 2: Upload Environment Variables to Vercel

### Step 2.1: Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
# OR
pnpm add -g vercel
```

### Step 2.2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 2.3: Link Your Project (if not already linked)

```bash
cd /Users/krewdev/balllooonappp-2
vercel link
```

Select your project or create a new one.

### Step 2.4: Upload Environment Variables

**Option A: Using the Automated Script**

The project includes a script to upload all variables:

```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

**⚠️ WARNING:** This script contains hardcoded values. Review and update it first!

**Option B: Manual Upload (Recommended)**

Upload variables one by one for better control:

```bash
# Database URL (you'll get this from your database provider - see Part 3)
vercel env add DATABASE_URL production
# Paste your PostgreSQL connection string when prompted

# Base URL
vercel env add NEXT_PUBLIC_BASE_URL production
# Enter: https://flyinghotair.com

# Stripe (PRODUCTION keys!)
vercel env add STRIPE_SECRET_KEY production
# Enter your LIVE Stripe secret key (sk_live_...)

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter your LIVE Stripe publishable key (pk_live_...)

vercel env add STRIPE_WEBHOOK_SECRET production
# Enter your webhook secret (whsec_...)

# Twilio
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_FROM_NUMBER production

# Admin tokens (generate new secure ones!)
vercel env add ADMIN_TOKEN production
vercel env add NEXT_PUBLIC_ADMIN_TOKEN production

# QR Security
vercel env add QR_SIGNING_SECRET production
vercel env add QR_MAX_AGE_SECONDS production

# Platform Fee
vercel env add PLATFORM_FEE_BPS production

# Node Environment
vercel env add NODE_ENV production
# Enter: production
```

**For Preview and Development environments:**

Repeat the same commands but replace `production` with `preview` or `development`:

```bash
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
# ... etc
```

### Step 2.5: Verify Environment Variables

```bash
vercel env ls
```

This lists all your environment variables.

---

## Part 3: Database Setup with Prisma

### Step 3.1: Choose Your Database Provider

**For Production, you need PostgreSQL.** Choose one:

1. **Vercel Postgres** (Easiest - integrated with Vercel)
   - Go to https://vercel.com/dashboard
   - Click "Storage" → "Create Database" → "Postgres"
   - Name it: `flyinghotair-db`
   - Copy the connection string

2. **Neon** (Recommended - Free tier, excellent)
   - Go to https://neon.tech
   - Sign up and create a project
   - Copy the connection string (format: `postgresql://user:pass@host/db`)

3. **Supabase** (Free tier, includes extras)
   - Go to https://supabase.com
   - Create a project
   - Go to Settings → Database → Connection String

4. **Railway** (Simple, good pricing)
   - Go to https://railway.app
   - Create a PostgreSQL database
   - Copy the connection string

### Step 3.2: Update Prisma Schema (Already Done!)

Your `prisma/schema.prisma` is already configured for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ This is correct! No changes needed.

### Step 3.3: Set Local DATABASE_URL

**For local development with PostgreSQL:**

```bash
# In your .env file
DATABASE_URL="postgresql://user:password@localhost:5432/flyinghotair_dev"
```

**OR continue using SQLite for local dev:**

```bash
# In your .env file
DATABASE_URL="file:./dev.db"
```

### Step 3.4: Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma Client based on your schema.

### Step 3.5: Run Database Migrations

**For Local Development (SQLite):**

```bash
npx prisma migrate dev --name init
```

**For Production (PostgreSQL):**

First, set your production DATABASE_URL:

```bash
# Option 1: Set in environment
export DATABASE_URL="postgresql://your-production-connection-string"

# Option 2: Use .env.production file
echo 'DATABASE_URL="postgresql://your-production-connection-string"' > .env.production
```

Then run migrations:

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# OR for production (applies existing migrations)
npx prisma migrate deploy
```

### Step 3.6: Verify Database Connection

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can see your database tables.

### Step 3.7: Seed the Database (Optional)

```bash
# Make sure DATABASE_URL is set
node scripts/seed.js
```

This creates initial test data (admin user, test pilots, etc.).

---

## Part 4: Production Database Setup

### Step 4.1: Add Production DATABASE_URL to Vercel

```bash
# Get your production PostgreSQL connection string from your provider
vercel env add DATABASE_URL production
# Paste your connection string when prompted
```

### Step 4.2: Run Migrations on Production

**Option A: Via Vercel (Automatic)**

Vercel will run `prisma generate` automatically during build. Migrations run via:

```bash
# In your package.json, the postinstall script runs: prisma generate
# For migrations, you can add a build command or run manually
```

**Option B: Manual Migration**

```bash
# Set production DATABASE_URL locally
export DATABASE_URL="your-production-postgres-url"

# Deploy migrations
npx prisma migrate deploy
```

**Option C: Via Vercel CLI**

```bash
vercel env pull .env.production
# Edit .env.production to add DATABASE_URL
npx prisma migrate deploy
```

### Step 4.3: Verify Production Database

After deployment, check your Vercel logs:

```bash
vercel logs
```

Look for any database connection errors.

---

## Part 5: Quick Checklist

### Local Setup
- [ ] Created `.env` file with all required variables
- [ ] Generated Prisma Client: `npx prisma generate`
- [ ] Ran migrations: `npx prisma migrate dev`
- [ ] Tested local database connection: `npx prisma studio`
- [ ] Seeded database (optional): `node scripts/seed.js`

### Production Setup
- [ ] Created PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
- [ ] Added `DATABASE_URL` to Vercel environment variables
- [ ] Added all other environment variables to Vercel
- [ ] Ran production migrations: `npx prisma migrate deploy`
- [ ] Verified production database connection
- [ ] Tested production deployment

---

## Part 6: Common Issues & Solutions

### Issue: "Environment variable not found"

**Solution:**
- Make sure variable is added to correct environment (production/preview/development)
- Redeploy after adding variables: `vercel --prod`

### Issue: "Database connection failed"

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs (most providers do this automatically)
- Ensure database is running and accessible

### Issue: "Prisma schema out of sync"

**Solution:**
```bash
npx prisma generate
npx prisma migrate dev
```

### Issue: "Migration failed"

**Solution:**
- Check if database already has tables
- Try: `npx prisma migrate reset` (⚠️ deletes all data!)
- Or: `npx prisma db push` (for development only)

---

## Part 7: Useful Commands Reference

```bash
# Environment Variables
vercel env ls                    # List all env vars
vercel env add KEY production    # Add env var
vercel env rm KEY production     # Remove env var
vercel env pull                  # Download env vars to .env.local

# Database
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev           # Create and apply migration (dev)
npx prisma migrate deploy        # Apply migrations (production)
npx prisma studio                # Open database GUI
npx prisma db push               # Push schema without migration (dev only)
npx prisma migrate reset         # Reset database (⚠️ deletes data!)

# Deployment
vercel                           # Deploy to preview
vercel --prod                    # Deploy to production
vercel logs                      # View logs
```

---

## Next Steps

After completing this setup:

1. **Test locally:** `pnpm dev` and verify everything works
2. **Deploy to production:** `vercel --prod`
3. **Monitor:** Check Vercel dashboard for any errors
4. **Test production:** Visit your production URL and test key flows

---

**Need Help?**
- Prisma Docs: https://www.prisma.io/docs
- Vercel Docs: https://vercel.com/docs
- Check `DEPLOYMENT_GUIDE.md` for more deployment details

