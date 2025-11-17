#!/bin/bash

# Script to start the dev server with automatic database seeding

echo "🚀 Starting development server with auto-seed..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Warning: DATABASE_URL is not set. Make sure your .env file is configured."
fi

# Run migrations if needed
echo "📊 Checking database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "   (Migrations already up to date or using dev mode)"

# Auto-seed if database is empty
echo "🌱 Checking if database needs seeding..."
node ./scripts/auto-seed.js

# Start the dev server
echo "✨ Starting Next.js dev server..."
npm run dev

