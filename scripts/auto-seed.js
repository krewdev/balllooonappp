#!/usr/bin/env node

/**
 * Auto-seed script that checks if database needs seeding and seeds it automatically
 * This can be run on startup or after migrations
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    // Check if admin accounts exist
    const adminCount = await prisma.admin.count();
    
    if (adminCount === 0) {
      console.log('📦 Database is empty. Running seed script...');
      // Run the seed script
      execSync('node ./scripts/seed.js', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully!');
    } else {
      console.log('✅ Database already has data. Skipping seed.');
      console.log(`   Found ${adminCount} admin account(s).`);
    }
  } catch (error) {
    console.error('❌ Error checking/seeding database:', error);
    // Don't exit on error - allow server to start anyway
    console.log('⚠️  Continuing without seeding...');
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

