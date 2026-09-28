import type { CookieOptions } from 'express';
import { NODE_ENV } from '../config/main.config';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Selaras dengan JWT_ACCESS_EXPIRES=15m dan JWT_REFRESH_EXPIRES=7d (default).
export const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 3600 * 1000;

const isProduction = NODE_ENV === 'production';

function baseCookie(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export function accessTokenCookie(): CookieOptions {
  return baseCookie(ACCESS_COOKIE_MAX_AGE_MS);
}

export function refreshTokenCookie(): CookieOptions {
  return baseCookie(REFRESH_COOKIE_MAX_AGE_MS);
}

export function clearAuthCookies(): CookieOptions {
  return baseCookie();
}
