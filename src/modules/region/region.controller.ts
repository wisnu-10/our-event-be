import type { Request, Response } from 'express';
import { regionService } from './region.service';
import { validated } from '../../middlewares/request-validation.middleware';
import { sendSuccess } from '../../helpers/response.helper';

export const regionController = {
  async provinces(_req: Request, res: Response) {
    const result = await regionService.listProvinces();

    return sendSuccess(res, 'Daftar provinsi berhasil dimuat', result);
  },

  async regencies(req: Request, res: Response) {
    const { provinceCode } = validated<{ provinceCode: string }>(
      req,
      'query',
      { provinceCode: '' },
    );
    const result = await regionService.listRegencies(provinceCode);

    return sendSuccess(res, 'Daftar kota/kabupaten berhasil dimuat', result);
  },
};
