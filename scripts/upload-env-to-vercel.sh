#!/bin/bash

# Script to upload environment variables from local .env file to Vercel
# Usage: ./scripts/upload-env-to-vercel.sh [production|preview|development]

set -e

ENVIRONMENT=${1:-production}

if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in current directory"
    echo "Please create a .env file with your environment variables first."
    exit 1
fi

echo "📤 Uploading environment variables to Vercel ($ENVIRONMENT environment)..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

# Read .env file and upload each variable
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    
    # Remove quotes from value if present
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    # Skip if key or value is empty
    [[ -z "$key" || -z "$value" ]] && continue
    
    echo "Adding: $key"
    echo "$value" | vercel env add "$key" "$ENVIRONMENT" 2>/dev/null || {
        echo "  ⚠️  Variable already exists. Skipping..."
    }
done < .env

echo ""
echo "✅ Done! Environment variables uploaded to Vercel ($ENVIRONMENT)"
echo ""
echo "To verify, run: vercel env ls"
echo "To deploy, run: vercel --prod"

