import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../helpers/jwt.helper';
import AppError from '../helpers/app-error.helper';
import { ACCESS_TOKEN_COOKIE } from '../helpers/cookie.helper';
import type { AuthPayload } from '../types/auth.dto';

export function jwtVerify() {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;

    if (!token) throw AppError('Sesi berakhir atau kamu belum login', 401);

    try {
      const payload = verifyAccessToken(token);

      res.locals.payload = { id: payload.id, role: payload.role } as AuthPayload;

      next();
    } catch {
      throw AppError('Sesi tidak valid atau kedaluwarsa. Silakan login lagi.', 401);
    }
  };
}

export function roleverify(allowedRoles: AuthPayload['role'][]) {
  return function (_req: Request, res: Response, next: NextFunction) {
    const payload = res.locals.payload as AuthPayload | undefined;

    const accessRole = allowedRoles.join(' atau ');

    if (!payload?.role || !allowedRoles.includes(payload.role)) {
      throw AppError(`Hanya ${accessRole} yang bisa mengakses halaman ini`, 403);
    }

    next();
  };
}

export function getAuthPayload(res: Response): AuthPayload {
  return res.locals.payload as AuthPayload;
}
