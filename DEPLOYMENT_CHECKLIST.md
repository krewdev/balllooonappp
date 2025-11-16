# 🚀 Production Deployment Checklist

## 🔴 CRITICAL - Must Fix Before Deployment

### 1. **Fix TypeScript Compilation Errors**
- [x] Fix `lib/sessions.ts` line 78 - `await cookies()` before calling `.get()` ✅ **ALREADY CORRECT**
- [x] Fix `app/api/pilot/stripe/account/route.ts` line 9 - `await cookies()` before calling `.get()` ✅ **ALREADY CORRECT**
- [x] Run `npm run build` to verify no TypeScript errors ✅ **BUILD PASSED - ALL ERRORS FIXED**
- [x] Enable TypeScript checking: Remove `ignoreBuildErrors: true` from `next.config.mjs` ✅ **ALREADY ENABLED**
- [x] Enable ESLint checking: Remove `ignoreDuringBuilds: true` from `next.config.mjs` ✅ **ALREADY ENABLED**
- [x] Fixed all Prisma relation name errors (changed `pilot` → `Pilot`, `passenger` → `Passenger`, `flight` → `Flight`, `bookings` → `Booking`) ✅ **COMPLETED**

### 2. **Database Migration (SQLite → Production DB)**
- [x] **CRITICAL**: SQLite (`file:./dev.db`) is NOT suitable for production ✅ **MIGRATED TO POSTGRESQL**
- [x] Choose production database:
  - [x] Recommended: PostgreSQL (Vercel Postgres, Supabase, Neon, Railway) ✅ **USING NEON**
  - [ ] Alternative: MySQL, PlanetScale
- [x] Update `prisma/schema.prisma` datasource provider ✅ **POSTGRESQL CONFIGURED**
- [x] Set production `DATABASE_URL` environment variable ✅ **NEON CONNECTION STRING SET**
- [x] Run migrations: `npx prisma migrate deploy` ✅ **5 MIGRATIONS APPLIED**
- [x] Test database connection before go-live ✅ **CONNECTION VERIFIED**

### 3. **Session Storage (File-Based → Production Storage)**
- [x] **CRITICAL**: File-based sessions (`.next/sessions.json`) won't work in serverless
- [x] Implement production session storage:
  - [x] Option A: Database-backed sessions (recommended) ✅ **ALREADY IMPLEMENTED**
  - [ ] Option B: Redis/Upstash for session storage
  - [ ] Option C: JWT-based sessions (stateless)
- [x] Update `lib/sessions.ts` with production implementation ✅ **USING DATABASE**
- [x] Test session persistence across deployments ✅ **ALL TESTS PASSED**

### 4. **Environment Variables - Required**
- [x] Created environment variable verification script: `scripts/verify-env.js` ✅
- [ ] Run `node scripts/verify-env.js` to verify all variables are set
- [ ] `DATABASE_URL` - Production database connection string
- [ ] `NEXT_PUBLIC_BASE_URL` - Production URL (e.g., https://flyinghotair.com)
- [ ] `STRIPE_SECRET_KEY` - Production Stripe secret key (sk_live_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Production Stripe publishable key (pk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Production webhook secret (whsec_...)
- [ ] `TWILIO_ACCOUNT_SID` - Production Twilio Account SID
- [ ] `TWILIO_AUTH_TOKEN` - Production Twilio Auth Token
- [ ] `TWILIO_FROM_NUMBER` - Production Twilio phone number
- [ ] `ADMIN_TOKEN` - Secure random token for admin API access
- [ ] `NEXT_PUBLIC_ADMIN_TOKEN` - Same as ADMIN_TOKEN for client-side requests
- [ ] `NODE_ENV` - Set to "production"

### 5. **Stripe Configuration**
- [ ] Switch from test mode to live mode in Stripe dashboard
- [ ] Configure production webhook endpoint: `https://yourdomain.com/api/webhook`
- [ ] Subscribe to events: `checkout.session.completed`
- [ ] Copy new webhook secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Complete Stripe Connect platform onboarding
- [ ] Set platform fee percentage in `PLATFORM_FEE_BPS` (default: 500 = 5%)
- [ ] Test a real payment flow end-to-end

### 6. **Twilio Configuration**
- [ ] Upgrade from trial account to paid account (remove verified number restrictions)
- [ ] Verify Twilio phone number is SMS-capable
- [ ] Set up proper SMS opt-in/opt-out handling
- [ ] Add SMS compliance footer to messages
- [ ] Test SMS delivery to multiple carriers

## 🟡 HIGH PRIORITY - Security & Performance

### 7. **Security Hardening**
- [x] Remove debug logging from production code ✅ **COMPLETED**
  - [x] Made console.log statements conditional (development only) in:
    - `app/api/webhook/route.ts` - Webhook event logging
    - `app/api/flight/[id]/notify/route.ts` - Mock SMS logging
    - `app/api/pilot/flights/notify/route.ts` - Success message logging
    - `lib/twilio.ts` - Mock Twilio client logging
  - [x] Kept console.error statements (useful for production error tracking)
  - [x] `app/api/auth/login/route.ts` - Already only uses console.error ✅
- [x] Implement rate limiting on: ✅ **COMPLETED**
  - [x] Login endpoints (`/api/auth/login`) - 5 attempts per 15 minutes ✅
  - [x] Registration endpoints (`/api/pilot/register`, `/api/passenger/register`) - 3 attempts per hour ✅
  - [x] SMS sending endpoints (`/api/flight/[id]/notify`, `/api/pilot/flights/notify`) - 10 requests per hour ✅
- [ ] Add CSRF protection
- [x] Set secure cookie flags in production ✅ **ALREADY IMPLEMENTED**
  - [x] `app/api/auth/login/route.ts` - HttpOnly, SameSite=Lax, Secure (conditional on NODE_ENV) ✅
  - [x] `app/api/auth/admin/login/route.ts` - HttpOnly, SameSite=Lax, Secure (conditional on NODE_ENV) ✅
- [x] Implement proper input validation on all API routes ✅ **PARTIALLY COMPLETED**
  - [x] Created `lib/validation.ts` with validation utilities ✅
  - [x] Added email validation to login endpoint ✅
  - [x] Added email, phone, ZIP code validation to registration endpoints ✅
  - [ ] Apply validation to remaining API routes
- [x] Add SQL injection protection (use Prisma parameterized queries only) ✅ **ALREADY PROTECTED** (Prisma uses parameterized queries)
- [x] Sanitize user inputs to prevent XSS ✅ **PARTIALLY COMPLETED**
  - [x] Created `lib/validation.ts` with sanitization utilities ✅
  - [x] Applied sanitization to registration endpoints ✅
  - [ ] Apply sanitization to remaining API routes
- [x] Add helmet.js or similar security headers ✅ **COMPLETED**
  - [x] Added security headers to `middleware.ts` ✅
  - [x] X-Frame-Options, X-Content-Type-Options, X-XSS-Protection ✅
  - [x] Strict-Transport-Security (HSTS) ✅
  - [x] Referrer-Policy ✅
- [x] Set up Content Security Policy (CSP) ✅ **COMPLETED**
  - [x] Added CSP headers to `middleware.ts` ✅
  - [x] Configured for Stripe and Twilio integrations ✅

### 8. **Password & Authentication Security**
- [x] Verify bcrypt salt rounds are 10+ ✅ **VERIFIED** (using 10 rounds in all password hashing)
- [x] Implement password complexity requirements ✅ **COMPLETED**
  - [x] Created `validatePassword` function in `lib/validation.ts` ✅
  - [x] Requirements: min 8 chars, max 128 chars, lowercase, uppercase, number ✅
  - [x] Applied to pilot registration endpoint ✅
  - [x] Applied to passenger registration endpoint ✅
- [ ] Add password reset functionality
- [ ] Implement account lockout after failed login attempts
- [ ] Add email verification for new accounts
- [ ] Consider 2FA for pilot accounts
- [ ] Implement session timeout/refresh mechanism

### 9. **Admin Access Security**
- [ ] Generate strong `ADMIN_TOKEN` (minimum 32 characters, cryptographically random)
- [ ] Store admin credentials securely
- [ ] Implement proper admin authentication (not just token-based)
- [ ] Add audit logging for admin actions
- [ ] Consider separate admin subdomain/path

### 10. **Image Optimization**
- [x] Review `next.config.mjs` - `unoptimized: true` should be removed for production ✅ **ALREADY CORRECT** (no unoptimized flag found)
- [ ] Set up proper image domains if using external images
- [ ] Consider using Vercel Image Optimization or similar CDN

### 11. **Error Handling & Monitoring**
- [ ] Set up error tracking (Sentry, LogRocket, or similar)
- [x] Implement proper error boundaries in React components ✅ **COMPLETED**
  - [x] Created `components/error-boundary.tsx` with ErrorBoundary class component ✅
  - [x] Added ErrorBoundaryWrapper to root layout ✅
  - [x] Displays user-friendly error UI with retry option ✅
  - [x] Logs errors in development, ready for production error tracking integration ✅
- [ ] Add structured logging for production
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Create alerts for critical errors
- [ ] Monitor Stripe webhook failures
- [ ] Monitor Twilio SMS delivery failures

## 🟢 MEDIUM PRIORITY - Best Practices

### 12. **Performance Optimization**
- [ ] Enable Next.js compiler optimizations
- [ ] Implement proper caching strategies
- [x] Add database indexes for frequently queried fields: ✅ **COMPLETED**
  - [x] Pilot: email (unique), approved, stripeAccountId ✅
  - [x] Passenger: email (unique), phone ✅
  - [x] Flight: pilotId, date ✅
  - [x] Booking: flightId, passengerId, status ✅
  - [x] Migration created and ready to deploy ✅
- [ ] Optimize Prisma queries (use `select` to limit fields)
- [ ] Consider implementing Redis caching for frequently accessed data

### 13. **Data Backup & Recovery**
- [ ] Set up automated database backups
- [ ] Test backup restoration process
- [ ] Document recovery procedures
- [ ] Set up point-in-time recovery if available

### 14. **Compliance & Legal**
- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Implement GDPR compliance (if applicable):
  - Data export functionality
  - Account deletion functionality
  - Cookie consent banner
- [ ] Add TCPA compliance for SMS (USA):
  - Explicit opt-in for SMS
  - Clear opt-out instructions
  - Keep consent records
- [ ] Add PCI compliance measures (Stripe handles most of this)

### 15. **Testing**
- [x] Created comprehensive manual testing guide: `MANUAL_TESTING_GUIDE.md` ✅
- [x] Created automated human-flow test script: `scripts/test-human-flow.js` ✅
- [x] Added npm script: `npm run test:flow` ✅
- [ ] Run smoke tests: `npm run smoke`
- [ ] Test complete user journeys (see MANUAL_TESTING_GUIDE.md):
  - [ ] Pilot registration → approval → Stripe onboarding → flight creation
  - [ ] Passenger notification → booking → payment
  - [ ] Admin pilot approval workflow
- [ ] Test all payment flows end-to-end with real Stripe test cards
- [ ] Test SMS delivery to real phone numbers
- [ ] Test error scenarios (failed payments, failed SMS, etc.)
- [ ] Load test critical endpoints

### 16. **Documentation**
- [ ] Update README.md with production setup instructions
- [ ] Document environment variables
- [ ] Create runbook for common operations
- [ ] Document database schema changes
- [ ] Create API documentation
- [ ] Document deployment process

## 🔵 LOW PRIORITY - Nice to Have

### 17. **User Experience**
- [ ] Add loading states to all async operations
- [ ] Implement proper form validation feedback
- [ ] Add success/error toast notifications
- [ ] Implement offline handling
- [ ] Add PWA capabilities if needed
- [ ] Optimize mobile experience

### 18. **Feature Completions**
- [ ] Complete Stripe onboarding integration in dashboard (marked as incomplete in todo)
- [ ] Add pilot rejection functionality (currently only logs warning)
- [ ] Implement passenger weight tracking (field exists but not fully utilized)
- [ ] Add email notification system (currently only SMS)
- [ ] Implement flight cancellation workflow
- [ ] Add booking refund handling

### 19. **Analytics & Insights**
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Track conversion funnels
- [ ] Monitor user engagement
- [ ] Track business metrics (bookings, revenue, etc.)

### 20. **SEO & Marketing**
- [ ] Add meta tags for social sharing
- [ ] Create sitemap.xml
- [ ] Add robots.txt
- [ ] Implement structured data (Schema.org)
- [ ] Optimize page titles and descriptions

## 📋 Pre-Deployment Verification

### Final Checks
- [ ] All environment variables set in production
- [ ] Database migrations applied successfully
- [ ] Stripe webhooks configured and tested
- [ ] SMS delivery tested with production credentials
- [ ] Build completes without errors: `npm run build`
- [ ] Production build starts successfully: `npm start`
- [ ] No console errors in production build
- [ ] All critical user flows tested in staging environment
- [ ] Backup and rollback plan documented
- [ ] Team notified of deployment window

## 🚨 Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error rates
- [ ] Check webhook delivery rates (Stripe, Twilio)
- [ ] Verify database performance
- [ ] Monitor server response times
- [ ] Check for any unexpected errors in logs
- [ ] Test critical flows with real users
- [ ] Monitor payment processing
- [ ] Verify SMS delivery

### First Week
- [ ] Review performance metrics
- [ ] Analyze user feedback
- [ ] Check for any data inconsistencies
- [ ] Monitor costs (database, Stripe fees, Twilio fees, hosting)
- [ ] Review security logs
- [ ] Plan any necessary hotfixes

## 🔧 Vercel-Specific Configuration

If deploying to Vercel:
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Link project: `vercel link`
- [ ] Set environment variables via Vercel dashboard or CLI
- [ ] Configure custom domain
- [ ] Set up preview deployments for branches
- [ ] Configure build settings (already in package.json)
- [ ] Set up Vercel Postgres if using (recommended)
- [ ] Configure serverless function regions
- [ ] Set function timeout limits (if needed for long-running operations)

## 📦 Alternative: Self-Hosted Deployment

If deploying to own infrastructure:
- [ ] Set up Node.js environment (v18+)
- [ ] Install PM2 or similar process manager
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Configure auto-restart on failure
- [ ] Set up health check endpoint
- [ ] Configure load balancing (if needed)

## 🎯 Deployment Priority Order

1. **Phase 1 - Critical Fixes** (Items 1-6)
   - Fix compilation errors
   - Migrate database
   - Fix session storage
   - Set environment variables
   - Configure Stripe & Twilio
   
2. **Phase 2 - Security** (Items 7-9)
   - Security hardening
   - Authentication improvements
   - Admin access security

3. **Phase 3 - Stability** (Items 10-15)
   - Monitoring & error handling
   - Performance optimization
   - Testing & compliance

4. **Phase 4 - Polish** (Items 16-20)
   - Documentation
   - UX improvements
   - Analytics & SEO

---

## ⚠️ DEPLOYMENT BLOCKERS (Must Complete)

These items WILL cause production failures if not addressed:

1. ❌ Database: SQLite is local-only, won't work in serverless
2. ❌ Sessions: File-based storage won't persist across serverless invocations
3. ❌ TypeScript errors: Build will fail with current errors
4. ❌ Missing environment variables: App will crash without required config
5. ❌ Stripe webhook: Payments won't be confirmed without production webhook

**DO NOT DEPLOY** until these 5 blockers are resolved.

---

**Estimated Time to Production-Ready:**
- Critical fixes only: 4-8 hours
- With security & stability: 2-3 days
- Fully polished: 1-2 weeks

**Recommended Approach:**
1. Fix critical issues (1 day)
2. Deploy to staging environment
3. Complete security hardening (1 day)
4. Test thoroughly in staging
5. Deploy to production with monitoring
6. Address remaining items incrementally
