import prisma from '../src/prisma';
import { seedSuperadmin } from './seeds/superadmin';
import { seedDemoUsers } from './seeds/demo-users';
import { seedEvents } from './seeds/events';

async function main() {
  await seedSuperadmin();
  await seedDemoUsers();
  await seedEvents();

  // eslint-disable-next-line no-console
  console.log('Seed selesai: superadmin, admin, customer, 3 event PUBLISHED');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
