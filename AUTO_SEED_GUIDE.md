# 🌱 Automatic Database Seeding Guide

The database will now automatically populate with initial data when needed.

## How It Works

### Automatic Seeding Options

1. **After Migrations (Recommended)**
   ```bash
   npm run prisma:migrate:deploy
   ```
   This automatically runs seeding after migrations complete.

2. **On Dev Server Start**
   ```bash
   npm run dev:seed
   ```
   This checks if the database is empty and seeds it before starting the server.

3. **Manual Seeding**
   ```bash
   npm run seed
   ```
   Always available for manual seeding.

### What Gets Seeded

- ✅ **Admin Accounts:**
  - `rossb029@gmail.com` (password: `Balloon`)
  - `300jayblackout@gmail.com` (password: `Balloon`)

- ✅ **Platform Settings:**
  - Platform fee: 10% (1000 basis points)

- ✅ **Test Pilot:**
  - `pilot@example.com` (password: `pilotpass`)
  - Pre-approved and ready to use

- ✅ **Additional Test Pilots:**
  - 10 unapproved pilots for testing admin approval flow

## Prisma Seed Configuration

The `package.json` now includes:
```json
{
  "prisma": {
    "seed": "node ./scripts/seed.js"
  }
}
```

This allows Prisma CLI to automatically run seeding when:
- Running `prisma migrate reset` (resets and seeds)
- Running `prisma db seed` (manual seed command)

## Production Seeding

**⚠️ Important:** In production, seeding should be done manually and carefully:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-postgres-url"

# Run seed (will upsert, so safe to run multiple times)
npm run seed
```

The seed script uses `upsert` operations, so it's safe to run multiple times without creating duplicates.

## Troubleshooting

### Database not seeding?

1. **Check DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   ```

2. **Check database connection:**
   ```bash
   npx prisma studio
   ```

3. **Run seed manually:**
   ```bash
   npm run seed
   ```

### Want to reset and re-seed?

```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# This will automatically run seed after reset
```

## Scripts Reference

- `npm run seed` - Run seed script manually
- `npm run prisma:seed` - Alias for seed
- `npm run dev:seed` - Start dev server with auto-seed check
- `npm run prisma:migrate:deploy` - Deploy migrations + auto-seed

