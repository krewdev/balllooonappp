const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('pilotpass', 10);

  // Seed a specific, predictable pilot for development/testing
  await prisma.pilot.upsert({
    where: { email: 'pilot@example.com' },
    update: {},
    create: {
      id: 'pilot-123',
      email: 'pilot@example.com',
      fullName: 'John Doe (Dev)',
      phone: faker.phone.number(),
      passwordHash: hashedPassword,
      approved: true, // Pre-approve the seed pilot
      licenseNumber: `CPL-${faker.number.int({ min: 1000, max: 9999 })}`,
      licenseExpiry: faker.date.future(),
      yearsExperience: faker.number.int({ min: 2, max: 30 }),
      totalFlightHours: faker.number.int({ min: 100, max: 5000 }),
      insuranceProvider: faker.company.name(),
      insurancePolicyNumber: faker.string.alphanumeric(12).toUpperCase(),
      insuranceExpiry: faker.date.future(),
      balloonRegistration: `N${faker.string.alphanumeric(5).toUpperCase()}`,
      balloonCapacity: faker.number.int({ min: 2, max: 8 }),
    },
  });
  console.log('Upserted dev pilot: pilot@example.com');

  // Create a number of additional, unapproved pilots with fake data
  const numberOfPilots = 10;
  console.log(`Creating ${numberOfPilots} additional fake pilots...`);

  for (let i = 0; i < numberOfPilots; i++) {
    const fullName = faker.person.fullName();
    await prisma.pilot.create({
      data: {
        email: faker.internet.email({ firstName: fullName.split(' ')[0], lastName: fullName.split(' ')[1] }),
        fullName: fullName,
        phone: faker.phone.number(),
        approved: false, // These pilots need approval
        licenseNumber: `CPL-${faker.number.int({ min: 1000, max: 9999 })}`,
        licenseExpiry: faker.date.future(),
        yearsExperience: faker.number.int({ min: 2, max: 30 }),
        totalFlightHours: faker.number.int({ min: 100, max: 5000 }),
        insuranceProvider: faker.company.name(),
        insurancePolicyNumber: faker.string.alphanumeric(12).toUpperCase(),
        insuranceExpiry: faker.date.future(),
        balloonRegistration: `N${faker.string.alphanumeric(5).toUpperCase()}`,
        balloonCapacity: faker.number.int({ min: 2, max: 8 }),
      },
    });
  }

  console.log('Database has been seeded with realistic pilot data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
