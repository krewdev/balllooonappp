const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.pilot.upsert({
    where: { id: 'pilot-123' },
    update: {
      email: 'pilot@example.com',
      fullName: 'John Doe',
      phone: '+1 (555) 123-4567',
    },
    create: {
      id: 'pilot-123',
      email: 'pilot@example.com',
      fullName: 'John Doe',
      phone: '+1 (555) 123-4567',
    },
  })

  console.log('Seeded pilot: pilot-123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
