import { prisma } from '../../config/prisma-client.config';
import { hashing } from '../../helpers/bcrypt.helper';
import AppError from '../../helpers/app-error.helper';
import { buildMeta, parsePagination } from '../../helpers/pagination.helper';
import type {
  CreateAdminUserInput,
  QueryAdminUserInput,
} from './validators/admin-user.validator';

const publicSelect = { id: true, name: true, email: true, role: true, createdAt: true };

export const adminUserService = {
  async list(query: QueryAdminUserInput) {
    const { page, limit, skip } = parsePagination(query);
    const where = {
      deletedAt: null,
      role: query.role ?? { in: ['ADMIN', 'CUSTOMER'] as ('ADMIN' | 'CUSTOMER')[] },
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: publicSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { users, meta: buildMeta(page, limit, total) };
  },

  async create(input: CreateAdminUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError('Email sudah terdaftar', 409);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: await hashing(input.password),
        role: input.role,
      },
      select: publicSelect,
    });
    return { user };
  },

  async updateRole(id: string, role: 'ADMIN' | 'CUSTOMER', actorId: string) {
    if (id === actorId) throw AppError('Tidak bisa mengubah role akun sendiri', 403);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.deletedAt) throw AppError('User tidak ditemukan', 404);
    if (target.role === 'SUPERADMIN') throw AppError('Akun superadmin tidak bisa diubah', 403);
    const user = await prisma.user.update({ where: { id }, data: { role }, select: publicSelect });
    return { user };
  },

  async remove(id: string, actorId: string) {
    if (id === actorId) throw AppError('Tidak bisa menghapus akun sendiri', 403);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.deletedAt) throw AppError('User tidak ditemukan', 404);
    if (target.role === 'SUPERADMIN') throw AppError('Akun superadmin tidak bisa dihapus', 403);
    const [eventCount, orderCount] = await Promise.all([
      prisma.event.count({ where: { adminId: id, deletedAt: null } }),
      prisma.order.count({ where: { userId: id, deletedAt: null } }),
    ]);
    if (eventCount > 0 || orderCount > 0) {
      throw AppError('User sudah memiliki event/order, gunakan ubah role ke CUSTOMER', 409);
    }
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
    return { ok: true };
  },
};
