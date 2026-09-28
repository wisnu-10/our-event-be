import { prisma } from '../../config/prisma-client.config';
import AppError from '../../helpers/app-error.helper';
import type { UpdateUserInput } from './validators/update-user.validator';

const publicSelect = { id: true, name: true, email: true, role: true, createdAt: true, deletedAt: true };

export const userService = {
  async getProfile(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
    if (!user || user.deletedAt) throw AppError('User tidak ditemukan', 404);
    return user;
  },

  async updateProfile(id: string, input: UpdateUserInput) {
    return prisma.user.update({ where: { id }, data: { name: input.name }, select: publicSelect });
  },
};
