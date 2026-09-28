import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../helpers/response.helper';
import { getAuthPayload } from '../../middlewares/auth.middleware';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookie,
  clearAuthCookies,
  refreshTokenCookie,
} from '../../helpers/cookie.helper';
import type { LoginDTO, RegisterDTO } from '../../types/auth.dto';

export const authController = {
  async register(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body as RegisterDTO,
    );

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookie());
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookie());

    return sendSuccess(res, 'Registrasi berhasil', { user }, 201);
  },

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(req.body as LoginDTO);

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookie());
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookie());

    return sendSuccess(res, 'Login berhasil', { user });
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    const { user, accessToken } = await authService.refresh(refreshToken ?? '');

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookie());

    return sendSuccess(res, 'Token diperbarui', { user });
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    await authService.logout(refreshToken);

    res.clearCookie(ACCESS_TOKEN_COOKIE, clearAuthCookies());
    res.clearCookie(REFRESH_TOKEN_COOKIE, clearAuthCookies());

    return sendSuccess(res, 'Logout berhasil', { ok: true });
  },

  async me(_req: Request, res: Response) {
    const { id } = getAuthPayload(res);
    const user = await authService.me(id);

    return sendSuccess(res, 'Profil berhasil dimuat', { user });
  },
};
