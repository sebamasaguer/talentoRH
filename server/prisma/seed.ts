import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@talentohr.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log({ admin });

  // Also seed some sample data if it doesn't exist
  const org1 = await prisma.organization.upsert({
    where: { name: 'Ministerio de Salud' },
    update: {},
    create: { name: 'Ministerio de Salud' },
  });

  const profile1 = await prisma.functionalProfile.upsert({
    where: { name: 'Administrativo' },
    update: {},
    create: { name: 'Administrativo' },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
