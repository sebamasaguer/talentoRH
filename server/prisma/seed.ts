import { PrismaClient, PositionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Admin User
  const adminEmail = 'admin@talentohr.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  // 2. Organizations
  const orgNames = [
    'Ministerio de Salud',
    'Ministerio de Economía',
    'Ministerio de Educación',
    'Secretaría de Innovación',
    'Ministerio de Desarrollo Social'
  ];

  const orgs = [];
  for (const name of orgNames) {
    const org = await prisma.organization.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    orgs.push(org);
  }

  // 3. Functional Profiles
  const profileNames = [
    'Administrativo',
    'Profesional',
    'Técnico',
    'Maestranza',
    'Sistemas'
  ];

  const profiles = [];
  for (const name of profileNames) {
    const profile = await prisma.functionalProfile.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    profiles.push(profile);
  }

  // 4. Agents (Entrevistas)
  const agentsData = [
    {
      id: 'AG-1001',
      fullName: 'Juan Pérez',
      dni: '20111222',
      originOrgId: orgs[0].id, // Salud
      profileId: profiles[1].id, // Profesional
      keyCompetencies: 'Gestión de proyectos, Auditoría, Liderazgo de equipos',
      workingHours: 40,
      availableForRotation: true,
      interviewDate: new Date('2024-01-15')
    },
    {
      id: 'AG-1002',
      fullName: 'María García',
      dni: '30444555',
      originOrgId: orgs[1].id, // Economía
      profileId: profiles[0].id, // Administrativo
      keyCompetencies: 'Atención al público, Manejo de Excel avanzado, Liquidación de haberes',
      workingHours: 35,
      availableForRotation: true,
      interviewDate: new Date('2024-02-10')
    },
    {
      id: 'AG-1003',
      fullName: 'Ricardo Darín',
      dni: '10777888',
      originOrgId: orgs[2].id, // Educación
      profileId: profiles[2].id, // Técnico
      keyCompetencies: 'Mantenimiento preventivo, Redes, Soporte técnico',
      workingHours: 40,
      availableForRotation: false,
      interviewDate: new Date('2024-03-05')
    }
  ];

  for (const data of agentsData) {
    await prisma.agent.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  // 5. Positions (Búsquedas / Pedidos)
  const positionsData = [
    {
      id: 'POS-2001',
      requestingOrgId: orgs[3].id, // Secretaría de Innovación
      requestingArea: 'Transformación Digital',
      profileRequiredId: profiles[4].id, // Sistemas
      mainFunctions: 'Desarrollo de APIs, Integración de sistemas, Documentación técnica',
      hoursRequired: 40,
      requestDate: new Date('2024-03-01'),
      status: PositionStatus.Abierta
    },
    {
      id: 'POS-2002',
      requestingOrgId: orgs[4].id, // Desarrollo Social
      requestingArea: 'RRHH',
      profileRequiredId: profiles[0].id, // Administrativo
      mainFunctions: 'Carga de expedientes, Seguimiento de trámites, Atención telefónica',
      hoursRequired: 30,
      requestDate: new Date('2024-02-20'),
      status: PositionStatus.Abierta
    },
    {
      id: 'POS-2003',
      requestingOrgId: orgs[0].id, // Salud
      requestingArea: 'Contabilidad',
      profileRequiredId: profiles[1].id, // Profesional
      mainFunctions: 'Conciliaciones bancarias, Reportes trimestrales',
      hoursRequired: 40,
      requestDate: new Date('2024-01-10'),
      status: PositionStatus.Cubierta
    }
  ];

  for (const data of positionsData) {
    await prisma.position.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

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
