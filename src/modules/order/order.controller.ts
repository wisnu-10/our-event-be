import type { Request, Response } from 'express';
import { orderService } from './order.service';
import type { QueryOrderInput } from './validators/order.validator';
import { validated } from '../../middlewares/request-validation.middleware';
import { getAuthPayload } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../helpers/response.helper';
import AppError from '../../helpers/app-error.helper';

function orderCode(req: Request): string {
  return validated<{ orderCode: string }>(req, 'params', { orderCode: '' }).orderCode;
}

export const orderController = {
  async create(req: Request, res: Response) {
    const order = await orderService.create(getAuthPayload(res).id, req.body);

    return sendSuccess(res, 'Order berhasil dibuat', order, 201);
  },

  async detail(req: Request, res: Response) {
    const payload = getAuthPayload(res);
    const order = await orderService.detail(orderCode(req), payload.id, payload.role !== 'CUSTOMER');

    return sendSuccess(res, 'Detail order berhasil dimuat', order);
  },

  async listMine(req: Request, res: Response) {
    const result = await orderService.listMine(
      getAuthPayload(res).id,
      validated<QueryOrderInput>(req, 'query', {} as QueryOrderInput),
    );

    return sendSuccess(res, 'Daftar order berhasil dimuat', result);
  },

  async listAll(req: Request, res: Response) {
    const result = await orderService.listAll(
      validated<QueryOrderInput>(req, 'query', {} as QueryOrderInput),
    );

    return sendSuccess(res, 'Daftar order berhasil dimuat', result);
  },

  async uploadProof(req: Request, res: Response) {
    if (!req.file) throw AppError('File bukti bayar wajib diunggah', 400);
    const order = await orderService.uploadProof(orderCode(req), getAuthPayload(res).id, req.file.buffer);

    return sendSuccess(res, 'Bukti bayar berhasil diunggah', order);
  },

  async cancel(req: Request, res: Response) {
    const order = await orderService.cancel(orderCode(req), getAuthPayload(res).id);

    return sendSuccess(res, 'Order berhasil dibatalkan', order);
  },

  async approve(req: Request, res: Response) {
    const order = await orderService.approve(orderCode(req));

    return sendSuccess(res, 'Order berhasil disetujui', order);
  },

  async reject(req: Request, res: Response) {
    const order = await orderService.reject(orderCode(req), req.body);

    return sendSuccess(res, 'Order berhasil ditolak', order);
  },
};
