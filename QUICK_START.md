# Quick Start: Environment Variables & Database Setup

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Local `.env` File

```bash
cd /Users/krewdev/balllooonappp-2
cp .env.example .env  # If .env.example exists
# OR create manually
```

Add your variables (see `SETUP_GUIDE.md` for full list).

### Step 2: Install Vercel CLI & Login

```bash
npm i -g vercel
vercel login
```

### Step 3: Link Project to Vercel

```bash
vercel link
```

### Step 4: Upload Environment Variables

**Option A: Automated Script**
```bash
./scripts/upload-env-to-vercel.sh production
```

**Option B: Manual (one by one)**
```bash
vercel env add DATABASE_URL production
# Paste your PostgreSQL connection string
```

### Step 5: Set Up Database

1. **Create PostgreSQL database:**
   - Vercel Postgres: https://vercel.com/dashboard → Storage
   - Neon: https://neon.tech
   - Supabase: https://supabase.com

2. **Add DATABASE_URL to Vercel:**
   ```bash
   vercel env add DATABASE_URL production
   ```

3. **Run migrations:**
   ```bash
   # Set production DATABASE_URL locally
   export DATABASE_URL="your-postgres-connection-string"
   npx prisma migrate deploy
   ```

### Step 6: Generate Prisma Client & Test Locally

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio  # Opens database GUI
```

### Step 7: Deploy

```bash
vercel --prod
```

---

## 📋 Required Environment Variables

Copy these to your `.env` file:

```bash
DATABASE_URL="file:./dev.db"  # Local SQLite
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_FROM_NUMBER="+1..."
ADMIN_TOKEN="generate-with-crypto-randomBytes"
NEXT_PUBLIC_ADMIN_TOKEN="generate-with-crypto-randomBytes"
QR_SIGNING_SECRET="generate-with-crypto-randomBytes"
QR_MAX_AGE_SECONDS="86400"
PLATFORM_FEE_BPS="500"
NODE_ENV="development"
```

---

## 🔧 Generate Secure Tokens

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this 3 times for:
- `ADMIN_TOKEN`
- `NEXT_PUBLIC_ADMIN_TOKEN`
- `QR_SIGNING_SECRET`

---

## 📚 Full Documentation

See `SETUP_GUIDE.md` for detailed step-by-step instructions.

---

## ✅ Verification Checklist

- [ ] `.env` file created with all variables
- [ ] Vercel CLI installed and logged in
- [ ] Project linked to Vercel
- [ ] Environment variables uploaded to Vercel
- [ ] PostgreSQL database created
- [ ] `DATABASE_URL` added to Vercel
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Local test: `pnpm dev` works
- [ ] Production deploy: `vercel --prod` succeeds

