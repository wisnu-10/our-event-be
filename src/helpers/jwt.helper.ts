import jwt, { type SignOptions } from 'jsonwebtoken';
import {
  JWT_ACCESS_EXPIRES,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES,
  JWT_REFRESH_SECRET,
} from '../config/main.config';
import type { Role } from '@prisma/client';

export interface TokenPayload {
  id: string;
  role: Role;
}

export function jwtCreateToken(
  payload: object,
  secretKey: string,
  options: SignOptions,
): string {
  return jwt.sign(payload, secretKey, options);
}

export function signAccessToken(payload: TokenPayload): string {
  return jwtCreateToken(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES,
  } as SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwtCreateToken(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
