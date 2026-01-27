import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.position.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.functionalProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 0. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@talentohr.com',
      password: hashedPassword,
    }
  });

  // 2. Create Organizations
  const orgs = await Promise.all([
    prisma.organization.create({ data: { name: 'Ministerio de Salud' } }),
    prisma.organization.create({ data: { name: 'Ministerio de Educación' } }),
    prisma.organization.create({ data: { name: 'Ministerio de Economía' } }),
    prisma.organization.create({ data: { name: 'Secretaría de Transporte' } }),
    prisma.organization.create({ data: { name: 'Agencia de Recaudación' } }),
  ]);

  // 3. Create Functional Profiles
  const profiles = await Promise.all([
    prisma.functionalProfile.create({ data: { name: 'Administrativo' } }),
    prisma.functionalProfile.create({ data: { name: 'Profesional' } }),
    prisma.functionalProfile.create({ data: { name: 'Mantenimiento' } }),
    prisma.functionalProfile.create({ data: { name: 'Técnico IT' } }),
    prisma.functionalProfile.create({ data: { name: 'Servicios Generales' } }),
  ]);

  // 4. Create Agents
  const agents = [
    {
      id: 'A-101',
      fullName: 'Juan Manuel Pérez',
      originOrgId: orgs[0].id, // Salud
      profileId: profiles[0].id, // Administrativo
      keyCompetencies: 'Gestión de expedientes, atención al público, SAP.',
      workingHours: 40,
      availableForRotation: true,
      interviewDate: new Date('2024-05-15'),
    },
    {
      id: 'A-102',
      fullName: 'María Elena Gómez',
      originOrgId: orgs[1].id, // Educación
      profileId: profiles[1].id, // Profesional
      keyCompetencies: 'Licenciada en Psicología, mediación de conflictos, RRHH.',
      workingHours: 35,
      availableForRotation: true,
      interviewDate: new Date('2024-05-20'),
    },
    {
      id: 'A-103',
      fullName: 'Ricardo Darío Sosa',
      originOrgId: orgs[2].id, // Economía
      profileId: profiles[3].id, // Técnico IT
      keyCompetencies: 'Soporte técnico, redes, administración de servidores Windows.',
      workingHours: 40,
      availableForRotation: false,
      interviewDate: new Date('2024-05-22'),
    },
    {
      id: 'A-104',
      fullName: 'Laura Sofía Martínez',
      originOrgId: orgs[3].id, // Transporte
      profileId: profiles[0].id, // Administrativo
      keyCompetencies: 'Data entry, planillas Excel avanzado, liquidación de haberes.',
      workingHours: 30,
      availableForRotation: true,
      interviewDate: new Date('2024-05-25'),
    },
  ];

  for (const agentData of agents) {
    await prisma.agent.create({ data: agentData });
  }

  // 5. Create Positions
  const positions = [
    {
      id: 'B-501',
      requestingOrgId: orgs[4].id, // Recaudación
      requestingArea: 'Atención al Contribuyente',
      profileRequiredId: profiles[0].id, // Administrativo
      mainFunctions: 'Recepción de trámites, carga de datos en sistema, archivo.',
      hoursRequired: 40,
      requestDate: new Date('2024-06-01'),
      status: 'Abierta',
    },
    {
      id: 'B-502',
      requestingOrgId: orgs[0].id, // Salud
      requestingArea: 'Dirección de RRHH',
      profileRequiredId: profiles[1].id, // Profesional
      mainFunctions: 'Coordinación de capacitación interna y evaluación de desempeño.',
      hoursRequired: 35,
      requestDate: new Date('2024-06-05'),
      status: 'Abierta',
    },
  ];

  for (const posData of positions) {
    await prisma.position.create({ data: posData as any });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
