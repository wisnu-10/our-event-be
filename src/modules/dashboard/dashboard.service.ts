import { prisma } from '../../config/prisma-client.config';

export const dashboardService = {
  async stats(adminId: string) {
    const eventIds = (
      await prisma.event.findMany({
        where: { adminId, deletedAt: null },
        select: { id: true },
      })
    ).map((e) => e.id);

    const [totalEvents, byStatus, revenue] = await Promise.all([
      prisma.event.count({ where: { adminId, deletedAt: null } }),
      prisma.order.groupBy({
        by: ['status'],
        where: { eventId: { in: eventIds } },
        _count: { status: true },
      }),
      prisma.order.aggregate({
        where: { eventId: { in: eventIds }, status: 'APPROVED' },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      totalEvents,
      ordersByStatus: Object.fromEntries(byStatus.map((g) => [g.status, g._count.status])),
      revenue: revenue._sum.totalPrice?.toString() ?? '0',
    };
  },
};
