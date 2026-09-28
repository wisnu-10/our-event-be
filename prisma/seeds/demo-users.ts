import prisma from '../../src/prisma';
import { hashing } from '../../src/helpers/bcrypt.helper';

export async function seedDemoUsers() {
  await prisma.user.upsert({
    where: { email: 'admin@ourevent.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ourevent.local',
      password: await hashing('Admin123!'),
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@ourevent.local' },
    update: {},
    create: {
      name: 'Customer',
      email: 'customer@ourevent.local',
      password: await hashing('Customer123!'),
      role: 'CUSTOMER',
    },
  });
}
