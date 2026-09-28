import type { Response } from 'express';

export function sendSuccess(res: Response, message: string, data: unknown, status = 200) {
  return res.status(status).json({ success: true, message, data });
}
