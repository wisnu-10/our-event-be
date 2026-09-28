import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const PORT = Number(process.env.PORT ?? 5000);
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
export const DATABASE_URL = required('DATABASE_URL');
export const JWT_ACCESS_SECRET = required('JWT_ACCESS_SECRET');
export const JWT_REFRESH_SECRET = required('JWT_REFRESH_SECRET');
export const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? '';
export const REGION_API_URL = process.env.REGION_API_URL ?? 'https://konoland-api.vercel.app';
export const REGION_TIMEOUT_MS = Number(process.env.REGION_TIMEOUT_MS ?? 8000);
export const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB ?? 5);
export const ORDER_EXPIRY_HOURS = Number(process.env.ORDER_EXPIRY_HOURS ?? 24);
export const MAX_QTY_PER_ORDER = Number(process.env.MAX_QTY_PER_ORDER ?? 5);

export const isCloudinaryConfigured =
  CLOUDINARY_CLOUD_NAME !== '' && CLOUDINARY_API_KEY !== '' && CLOUDINARY_API_SECRET !== '';
