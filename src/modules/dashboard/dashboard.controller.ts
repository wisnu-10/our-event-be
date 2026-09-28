import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../helpers/response.helper';
import { getAuthPayload } from '../../middlewares/auth.middleware';

export const dashboardController = {
  async stats(_req: Request, res: Response) {
    const result = await dashboardService.stats(getAuthPayload(res).id);

    return sendSuccess(res, 'Statistik berhasil dimuat', result);
  },
};
