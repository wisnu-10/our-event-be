import prisma from '../../src/prisma';
import { hashing } from '../../src/helpers/bcrypt.helper';

export async function seedSuperadmin() {
  await prisma.user.upsert({
    where: { email: 'superadmin@ourevent.local' },
    update: {},
    create: {
      name: 'Superadmin',
      email: 'superadmin@ourevent.local',
      password: await hashing('Superadmin123!'),
      role: 'SUPERADMIN',
    },
  });
}
