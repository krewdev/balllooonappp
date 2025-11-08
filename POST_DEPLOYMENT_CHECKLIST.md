# Post-Deployment Setup Checklist

After deploying to flyinghotair.com, complete these steps:

## ✅ Immediate Actions

### 1. Update Base URL
- [x] Verify `NEXT_PUBLIC_BASE_URL=https://flyinghotair.com` in Vercel env vars
- [ ] Redeploy after changing env vars

### 2. Database Setup
- [ ] Created PostgreSQL database
- [ ] Added `DATABASE_URL` to Vercel
- [ ] Updated `prisma/schema.prisma` provider to `postgresql`
- [ ] Ran migrations: `npx prisma migrate deploy`
- [ ] Seeded database: `node scripts/seed.js`

### 3. Stripe Production Setup
- [ ] Switched to Stripe **LIVE** keys (sk_live_..., pk_live_...)
- [ ] Created webhook endpoint: `https://flyinghotair.com/api/webhook`
- [ ] Added webhook secret to Vercel env vars
- [ ] Selected webhook events:
  - checkout.session.completed
  - account.updated  
  - payment_intent.succeeded
  - payment_intent.payment_failed

### 4. Security Tokens
- [ ] Generated strong ADMIN_TOKEN (32+ chars)
- [ ] Generated strong QR_SIGNING_SECRET (32+ chars)
- [ ] Updated both in Vercel env vars

### 5. Domain Configuration
- [ ] Added A record: `@` → `76.76.21.21`
- [ ] Added CNAME record: `www` → `cname.vercel-dns.com`
- [ ] Verified SSL certificate (🔒 shows in browser)
- [ ] Tested: https://flyinghotair.com
- [ ] Tested: https://www.flyinghotair.com

---

## 🧪 Testing Checklist

Visit https://flyinghotair.com and test:

### Public Pages
- [ ] Homepage loads with video background
- [ ] "How It Works" page displays correctly
- [ ] Navigation works across all pages

### Pilot Flow
- [ ] Pilot registration form works
- [ ] Pilot can log in
- [ ] Dashboard shows correctly
- [ ] Onboarding tutorial appears for new pilots
- [ ] Stripe onboarding link works
- [ ] Flight creation works (after Stripe setup)
- [ ] QR code generation works
- [ ] Can view/manage flights
- [ ] Can view passengers
- [ ] SMS notifications work
- [ ] Can download pilot QR code

### Admin Flow
- [ ] Admin can log in with ADMIN_TOKEN
- [ ] Can view pending pilot applications
- [ ] Can approve pilots
- [ ] Can view all pilots

### Passenger Flow
- [ ] Passenger registration works
- [ ] Can browse available flights
- [ ] Booking process completes
- [ ] Stripe Checkout works
- [ ] Payment confirmation received
- [ ] Can view booked flights
- [ ] Can access flight via QR scan

### Email/SMS
- [ ] Twilio SMS notifications work
- [ ] Messages are not "mocked"

---

## 🔧 Optional Enhancements

### Monitoring
- [ ] Enable Vercel Analytics (free, auto-enabled)
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring (UptimeRobot)

### Performance
- [ ] Enable Vercel caching headers
- [ ] Optimize images (already using Next.js Image)
- [ ] Test Core Web Vitals

### Backup & Recovery
- [ ] Schedule database backups (daily recommended)
- [ ] Document restore procedure
- [ ] Store backup of .env variables securely

### SEO
- [ ] Add meta descriptions to pages
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console
- [ ] Add robots.txt
- [ ] Set up Google Analytics (optional)

---

## 📊 First Week Tasks

1. **Monitor Errors:**
   - Check Vercel logs daily
   - Fix any 500 errors immediately
   - Watch for database connection issues

2. **User Testing:**
   - Have real pilot complete full flow
   - Have real passenger book a flight
   - Process test payment end-to-end

3. **Performance:**
   - Check page load times
   - Verify mobile responsiveness
   - Test on different browsers

4. **Database:**
   - Monitor connection pool usage
   - Check query performance
   - Verify backups are working

---

## 🆘 Troubleshooting

### Site Not Loading
1. Check Vercel deployment status
2. Verify DNS propagation: `dig flyinghotair.com`
3. Check SSL certificate status in Vercel

### Database Errors
1. Verify DATABASE_URL is correct
2. Check database is accepting connections
3. Run migrations: `npx prisma migrate deploy`

### Stripe Errors  
1. Confirm using LIVE keys (not test)
2. Verify webhook endpoint is accessible
3. Check webhook secret matches

### Build Failures
1. Check build logs in Vercel
2. Verify all env vars are set
3. Test build locally: `npm run build`

---

## 📝 Maintenance Schedule

**Daily:**
- Check error logs
- Monitor uptime

**Weekly:**
- Review database performance
- Check Stripe transactions
- Update dependencies if needed

**Monthly:**
- Review and rotate security tokens
- Audit user access
- Database backup verification
- Performance review

---

## 🔐 Security Best Practices

- [ ] All secrets are in environment variables (never in code)
- [ ] ADMIN_TOKEN is strong (32+ characters)
- [ ] QR_SIGNING_SECRET is unique and strong
- [ ] Database uses SSL connections
- [ ] Stripe uses LIVE keys for production
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] No console.log statements in production
- [ ] Rate limiting enabled (add if needed)

---

## 📞 Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Stripe Support:** https://support.stripe.com
- **Database Provider:** [Your provider's support]
- **Domain Registrar:** [Your registrar's support]

---

## 🎉 Launch Announcement

Once everything is tested:

1. Announce to pilots via email
2. Post on social media
3. Update documentation
4. Create user guide for pilots
5. Prepare customer support FAQs

---

**Last Updated:** Deploy Date
**Status:** 🚧 In Progress → 🟢 Live → 🎯 Optimized
