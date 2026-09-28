import type { Request, Response } from 'express';
import { ticketService } from './ticket.service';
import { sendSuccess } from '../../helpers/response.helper';
import { getAuthPayload } from '../../middlewares/auth.middleware';
import { validated } from '../../middlewares/request-validation.middleware';

export const ticketController = {
  async listByOrder(req: Request, res: Response) {
    const { orderCode } = validated<{ orderCode: string }>(req, 'params', { orderCode: '' });
    const payload = getAuthPayload(res);
    const tickets = await ticketService.listByOrder(
      orderCode,
      payload.id,
      payload.role !== 'CUSTOMER',
    );

    return sendSuccess(res, 'Daftar tiket berhasil dimuat', tickets);
  },
};
