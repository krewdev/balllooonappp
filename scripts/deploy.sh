#!/bin/bash

# Quick Deployment Script for flyinghotair.com
# This script helps you deploy to Vercel

echo "🚀 Deploying to flyinghotair.com"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the project root."
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit them? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Pushed to GitHub successfully"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Deploy to Vercel (if Vercel CLI is installed)
if command -v vercel &> /dev/null; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployment initiated"
else
    echo ""
    echo "ℹ️  Vercel CLI not installed"
    echo "   Install with: npm install -g vercel"
    echo "   Or deploy via GitHub integration"
fi

echo ""
echo "✨ Deployment process complete!"
echo "   Check status at: https://vercel.com/dashboard"
echo "   Your site: https://flyinghotair.com"
