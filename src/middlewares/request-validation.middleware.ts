import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import AppError from '../helpers/app-error.helper';

export type ValidateSource = 'body' | 'query' | 'params';

export function validateRequest(schema: ZodType, source: ValidateSource = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw AppError(first?.message ?? 'Validasi gagal', 400);
    }
    // Express 5: req.query/req.params hanya getter — simpan hasil di req.validated.
    req.validated = { ...(req.validated ?? {}), [source]: parsed.data };
    if (source === 'body') req.body = parsed.data;
    return next();
  };
}

export function validated<T>(req: Request, source: ValidateSource, fallback: T): T {
  const v = req.validated?.[source] as T | undefined;
  return v ?? fallback;
}
