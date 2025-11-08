# Database Migration Guide: SQLite to PostgreSQL

## Why Migrate?

SQLite is file-based and won't work in serverless environments like Vercel. You need a production database like PostgreSQL.

## Option 1: Vercel Postgres (Recommended - Easiest)

### Setup Steps:

1. **Install Vercel Postgres**
   ```bash
   # Link your project to Vercel (if not already)
   vercel link
   
   # Create a Postgres database
   vercel postgres create
   ```

2. **Get Connection String**
   - Go to Vercel Dashboard → Storage → Your Database
   - Copy the `DATABASE_URL` connection string
   - Add it to your environment variables

3. **Update Prisma Schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Generate New Migration**
   ```bash
   npx prisma migrate dev --name init_postgres
   ```

5. **Deploy Migrations**
   ```bash
   npx prisma migrate deploy
   ```

## Option 2: Supabase (Free Tier Available)

1. **Create Account**: https://supabase.com
2. **Create New Project**
3. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy the connection string (use "Connection Pooling" for serverless)
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true`

4. **Update .env**:
   ```bash
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true"
   ```

5. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## Option 3: Railway (Simple & Fast)

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Create Database**:
   ```bash
   railway login
   railway init
   railway add postgresql
   ```

3. **Get Connection String**:
   ```bash
   railway variables
   # Look for DATABASE_URL
   ```

4. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## Option 4: Neon (Serverless Postgres)

1. **Create Account**: https://neon.tech
2. **Create Project**
3. **Get Connection String** from dashboard
4. **Add to .env**:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

5. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## Migration Checklist

- [ ] Choose provider (Vercel Postgres recommended)
- [ ] Create database
- [ ] Update `prisma/schema.prisma` provider to "postgresql"
- [ ] Set `DATABASE_URL` in production environment
- [ ] Run `npx prisma migrate deploy` to apply schema
- [ ] Test database connection
- [ ] Migrate existing data (if any) - see Data Migration section below
- [ ] Update Vercel/deployment platform environment variables

## Data Migration (If Needed)

If you have existing data in SQLite:

```bash
# 1. Export SQLite data
npx prisma db push --skip-generate
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const data = { pilots: await prisma.pilot.findMany(), passengers: await prisma.passenger.findMany(), flights: await prisma.flight.findMany(), bookings: await prisma.booking.findMany() }; console.log(JSON.stringify(data, null, 2)); })().then(() => process.exit(0));" > backup.json

# 2. Switch to PostgreSQL (update schema.prisma)

# 3. Import data (create a script or use Prisma Studio)
```

## Verification Steps

After migration:

```bash
# 1. Test connection
npx prisma db pull

# 2. Generate Prisma client
npx prisma generate

# 3. Run a test query
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.pilot.count().then(count => console.log('Pilots:', count)).finally(() => prisma.\$disconnect());"

# 4. Check Prisma Studio
npx prisma studio
```

## Update Production Environment

### For Vercel:

```bash
# Set environment variable
vercel env add DATABASE_URL production

# Paste your PostgreSQL connection string when prompted

# Redeploy
vercel --prod
```

### For Other Platforms:

Add `DATABASE_URL` to your platform's environment variables dashboard.

## Prisma Schema Update

Update your `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}

// Rest of your models remain the same...
```

## Important Notes

1. **Connection Pooling**: For serverless, use connection pooling (Supabase offers pgBouncer, Vercel Postgres handles this automatically)

2. **SSL Requirement**: Most hosted PostgreSQL requires SSL. Add `?sslmode=require` to connection string if needed.

3. **Migration Files**: Keep your `prisma/migrations` directory - these track schema history.

4. **Seed Data**: Re-run your seed script after migration:
   ```bash
   npm run seed
   ```

5. **Backup**: Always backup your SQLite database before migrating:
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

## Troubleshooting

**Error: SSL connection required**
- Add `?sslmode=require` to your DATABASE_URL

**Error: Connection pool timeout**
- Use connection pooling URL (pgBouncer)
- Reduce connection pool size in Prisma

**Error: Too many connections**
- Use Prisma's connection pooling
- Consider using a connection pooler like PgBouncer

## Cost Estimates

- **Vercel Postgres**: Free tier (256 MB), Paid from $20/month
- **Supabase**: Free tier (500 MB), Paid from $25/month
- **Railway**: ~$5-10/month for small DB
- **Neon**: Free tier (3 GB), Paid from $19/month

## Recommended for Production

**Vercel Postgres** - Best if already deploying to Vercel, seamless integration.

**Supabase** - Best free tier, includes realtime features, auth, storage.

**Neon** - Best for pure PostgreSQL, excellent free tier, true serverless.
