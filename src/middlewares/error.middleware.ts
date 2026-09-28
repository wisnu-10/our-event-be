import type { NextFunction, Request, Response } from 'express';

export function notFound(_req: Request, res: Response) {
  return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan', data: null });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  console.log(err);
  if (err.name === 'MulterError') {
    return res.status(413).json({ success: false, message: err.message, data: null });
  }
  if (err.message.startsWith('Multipart:')) {
    return res.status(400).json({ success: false, message: 'Format multipart tidak valid', data: null });
  }
  const statusCode =
    (err as Error & { expose?: boolean; statusCode?: number }).expose === true
      ? ((err as Error & { statusCode?: number }).statusCode ?? 500)
      : 500;
  const message =
    (err as Error & { expose?: boolean }).expose === true ? err.message : 'Terjadi kesalahan server';

  return res.status(statusCode).json({ success: false, message, data: null });
}
