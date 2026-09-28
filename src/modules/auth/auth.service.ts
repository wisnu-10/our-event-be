import { prisma } from '../../config/prisma-client.config';
import { hashing, hashMatch } from '../../helpers/bcrypt.helper';
import AppError from '../../helpers/app-error.helper';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../helpers/jwt.helper';
import type { LoginDTO, RegisterDTO } from '../../types/auth.dto';
import type { Role } from '@prisma/client';

// Blacklist refresh token in-memory (v1, single instance).
const revokedRefreshTokens = new Set<string>();

function tokensFor(user: { id: string; role: Role }) {
  return {
    accessToken: signAccessToken({ id: user.id, role: user.role }),
    refreshToken: signRefreshToken({ id: user.id, role: user.role }),
  };
}

const publicSelect = { id: true, name: true, email: true, role: true, createdAt: true, deletedAt: true };

export const authService = {
  async register(input: RegisterDTO) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError('Email sudah terdaftar', 409);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: await hashing(input.password),
        role: 'CUSTOMER',
      },
      select: publicSelect,
    });
    return { user, ...tokensFor(user) };
  },

  async login(input: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || user.deletedAt) throw AppError('Email atau password salah', 401);
    const ok = await hashMatch(input.password, user.password);
    if (!ok) throw AppError('Email atau password salah', 401);
    const publicUser = await prisma.user.findUnique({ where: { id: user.id }, select: publicSelect });
    return { user: publicUser!, ...tokensFor(user) };
  },

  async refresh(refreshToken: string) {
    if (!refreshToken || revokedRefreshTokens.has(refreshToken)) {
      throw AppError('Refresh token tidak valid', 401);
    }
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError('Refresh token tidak valid', 401);
    }
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: publicSelect });
    if (!user || user.deletedAt) throw AppError('Refresh token tidak valid', 401);
    return { user, accessToken: signAccessToken({ id: user.id, role: user.role }) };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) revokedRefreshTokens.add(refreshToken);
    return { ok: true };
  },

  async me(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
    if (!user || user.deletedAt) throw AppError('User tidak ditemukan', 404);
    return user;
  },
};
