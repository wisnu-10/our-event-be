import prisma from '../../src/prisma';

export async function seedEvents() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@ourevent.local' } });
  if (!admin) throw new Error('Seed admin tidak ditemukan, jalankan seedDemoUsers dulu');

  const now = new Date();
  const seeds = [
    {
      title: 'Konser Jazz Bandung',
      slug: 'konser-jazz-bandung-a1b2',
      description: 'Malam penuh alunan jazz bersama musisi terbaik tanah air di jantung Kota Bandung.',
      location: 'Gedung Sate, Kota Bandung, Jawa Barat',
      provinceCode: '32',
      province: 'Jawa Barat',
      regencyCode: '3273',
      regency: 'Bandung',
      regencyType: 'Kota',
      addressDetail: 'Gedung Sate, Jl. Diponegoro No. 22',
      category: 'music',
      startDate: new Date(now.getTime() + 30 * 24 * 3600 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
      price: 150000,
      quota: 500,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Workshop Fotografi Dasar',
      slug: 'workshop-fotografi-dasar-c3d4',
      description: 'Belajar teknik dasar fotografi: komposisi, pencahayaan, dan editing untuk pemula.',
      location: 'Balai Kota, Kota Jakarta Selatan, DKI Jakarta',
      provinceCode: '31',
      province: 'DKI Jakarta',
      regencyCode: '3174',
      regency: 'Jakarta Selatan',
      regencyType: 'Kota',
      addressDetail: 'Balai Kota, Jl. Kebon Sirih',
      category: 'workshop',
      startDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000),
      endDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000 + 8 * 3600 * 1000),
      price: 75000,
      quota: 100,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Festival Kuliner Nusantara',
      slug: 'festival-kuliner-nusantara-e5f6',
      description: 'Cicipi ratusan kuliner khas dari seluruh Indonesia dalam satu tempat.',
      location: 'Alun-Alun, Kota Surabaya, Jawa Timur',
      provinceCode: '35',
      province: 'Jawa Timur',
      regencyCode: '3578',
      regency: 'Surabaya',
      regencyType: 'Kota',
      addressDetail: 'Alun-Alun Surabaya',
      category: 'food',
      startDate: new Date(now.getTime() + 45 * 24 * 3600 * 1000),
      endDate: new Date(now.getTime() + 47 * 24 * 3600 * 1000),
      price: 25000,
      quota: 2000,
      status: 'PUBLISHED' as const,
    },
  ];

  for (const e of seeds) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: { ...e, adminId: admin.id },
    });
  }
}
