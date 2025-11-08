#!/bin/bash

# Add all environment variables to Vercel
# For production environment

echo "Adding environment variables to Vercel..."

# NEXT_PUBLIC_BASE_URL (update for production)
echo "https://flyinghotair.com" | vercel env add NEXT_PUBLIC_BASE_URL production
echo "https://flyinghotair.com" | vercel env add NEXT_PUBLIC_BASE_URL preview
echo "http://localhost:3000" | vercel env add NEXT_PUBLIC_BASE_URL development

# Stripe
echo "sk_test_51SLD84PLSGp8q35gnPSjCzD9KelRdZOzrG9utCZbZROZF3WTVfbYJBSaRPcm9eJOUmVTPtjnq4zWBNFwgi0tj4NV00q0QmN0NI" | vercel env add STRIPE_SECRET_KEY production preview development

echo "pk_test_51SLD84PLSGp8q35gDfk0cfBjgNs4jwFzPmscakCG3YC06seWbfrJ19z0ZiaivVaxr6DrC45OjYfEUwUvozEWqO1S00jrmB2lOf" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview development

echo "whsec_YOUR_WEBHOOK_SECRET_HERE" | vercel env add STRIPE_WEBHOOK_SECRET production preview development

# Platform fee
echo "500" | vercel env add PLATFORM_FEE_BPS production preview development

# Twilio
echo "ACea2c1de55e2fedba56ab19b119b907e0" | vercel env add TWILIO_ACCOUNT_SID production preview development

echo "e679ef2e1c48ffe96fd9c26f70f24860" | vercel env add TWILIO_AUTH_TOKEN production preview development

echo "+18339151290" | vercel env add TWILIO_FROM_NUMBER production preview development

# Admin tokens
echo "a6b1b493961d0b00f179271d75d225918d1b16af93e0094a31c60e007e03ffe6" | vercel env add ADMIN_TOKEN production preview development

echo "f1d36305dd27680edfb5dbbc82c383b4b02e402740eaefcb1d86ca046938a764" | vercel env add NEXT_PUBLIC_ADMIN_TOKEN production preview development

# QR Security
echo "06feba9e93ad18634580a8eb85c3fadcad93f0d313b3b1e567a6aae9a9152765" | vercel env add QR_SIGNING_SECRET production preview development

echo "86400" | vercel env add QR_MAX_AGE_SECONDS production preview development

# Node environment
echo "production" | vercel env add NODE_ENV production

echo "Done! All environment variables added to Vercel."
