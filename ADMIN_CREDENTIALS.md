# Admin Credentials

## Default Admin Account

After running the seed script (`npm run seed`), the following admin account is created:

**Email:** `admin@flyinghotair.com`  
**Password:** `adminpass`

## How to Access Admin Panel

1. Navigate to: `http://localhost:3000/admin/login`
2. Enter the credentials above
3. You'll be redirected to the admin dashboard

## Creating/Updating Admin Account

To create or update the admin account, run:

```bash
npm run seed
```

This will:
- Create the admin account if it doesn't exist
- Update it if it already exists (keeps the same password)

## Location in Code

- Seed script: `scripts/seed.js` (line 11-20)
- Admin login endpoint: `app/api/auth/admin/login/route.ts`
- Admin login page: `app/admin/login/page.tsx`

## Security Note

⚠️ **For Production:** 
- Change the admin password immediately after deployment
- Consider implementing password reset functionality
- Store admin credentials securely (not in code)
- Use strong, randomly generated passwords

To change the admin password in production, you can:

1. **Option 1: Update via seed script**
   - Edit `scripts/seed.js` line 8: `await bcrypt.hash('YOUR_NEW_PASSWORD', 10)`
   - Run `npm run seed`

2. **Option 2: Direct database update**
   ```bash
   npx prisma studio
   # Navigate to Admin table and update passwordHash manually
   ```

3. **Option 3: Create a password reset script**
   ```javascript
   // scripts/reset-admin-password.js
   const bcrypt = require('bcryptjs');
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   
   async function main() {
     const newPassword = process.argv[2];
     if (!newPassword) {
       console.error('Usage: node scripts/reset-admin-password.js <new-password>');
       process.exit(1);
     }
     
     const hashed = await bcrypt.hash(newPassword, 10);
     await prisma.admin.update({
       where: { email: 'admin@flyinghotair.com' },
       data: { passwordHash: hashed }
     });
     console.log('Admin password updated successfully');
   }
   
   main().finally(() => prisma.$disconnect());
   ```

