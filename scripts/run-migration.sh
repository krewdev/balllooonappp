#!/bin/bash

# Script to run Prisma migrations
# Usage: ./scripts/run-migration.sh

set -e

echo "🔍 Checking for DATABASE_URL..."

if [ -z "$DATABASE_URL" ]; then
    if [ ! -f .env ]; then
        echo "❌ Error: .env file not found"
        echo "Please create a .env file with DATABASE_URL"
        exit 1
    fi
    
    # Try to load from .env
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found"
    echo ""
    echo "Please add DATABASE_URL to your .env file:"
    echo "DATABASE_URL=\"postgresql://user:password@host:port/database\""
    echo ""
    echo "Or set it as an environment variable:"
    echo "export DATABASE_URL=\"postgresql://user:password@host:port/database\""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🚀 Running migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"
echo ""
echo "To verify, run: npx prisma studio"

