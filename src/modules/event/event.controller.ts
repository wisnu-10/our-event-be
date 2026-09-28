import type { Request, Response } from 'express';
import { eventService } from './event.service';
import type { QueryEventInput } from './validators/event.validator';
import { validated } from '../../middlewares/request-validation.middleware';
import { getAuthPayload } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../helpers/response.helper';

export const eventController = {
  async create(req: Request, res: Response) {
    const event = await eventService.create(req.body, getAuthPayload(res).id);

    return sendSuccess(res, 'Event berhasil dibuat', event, 201);
  },

  async listPublic(req: Request, res: Response) {
    const result = await eventService.listPublic(
      validated<QueryEventInput>(req, 'query', {} as QueryEventInput),
    );

    return sendSuccess(res, 'Daftar event berhasil dimuat', result);
  },

  async listMine(req: Request, res: Response) {
    const result = await eventService.listMine(
      getAuthPayload(res).id,
      validated<QueryEventInput>(req, 'query', {} as QueryEventInput),
    );

    return sendSuccess(res, 'Daftar event berhasil dimuat', result);
  },

  async detail(req: Request, res: Response) {
    const payload = res.locals.payload as { id: string; role: string } | undefined;
    const event = await eventService.detailBySlug(
      validated<{ slug: string }>(req, 'params', { slug: '' }).slug,
      payload,
    );

    return sendSuccess(res, 'Detail event berhasil dimuat', event);
  },

  async update(req: Request, res: Response) {
    const event = await eventService.update(
      validated<{ id: string }>(req, 'params', { id: '' }).id,
      getAuthPayload(res).id,
      req.body,
    );

    return sendSuccess(res, 'Event berhasil diperbarui', event);
  },

  async remove(req: Request, res: Response) {
    await eventService.remove(
      validated<{ id: string }>(req, 'params', { id: '' }).id,
      getAuthPayload(res).id,
    );

    return sendSuccess(res, 'Event berhasil dihapus', { ok: true });
  },

  async publish(req: Request, res: Response) {
    const event = await eventService.publish(
      validated<{ id: string }>(req, 'params', { id: '' }).id,
      getAuthPayload(res).id,
      req.body,
    );

    return sendSuccess(res, 'Status event berhasil diubah', event);
  },
};
