import { z } from 'zod';
import { MAX_QTY_PER_ORDER } from '../../../config/main.config';

export const createOrderSchema = z.object({
  eventId: z.string().min(1, 'eventId wajib diisi'),
  quantity: z.coerce.number().int().min(1).max(MAX_QTY_PER_ORDER),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const rejectOrderSchema = z.object({
  rejectionNote: z.string().min(5, 'Alasan penolakan minimal 5 karakter'),
});
export type RejectOrderInput = z.infer<typeof rejectOrderSchema>;

export const queryOrderSchema = z.object({
  status: z
    .enum([
      'PENDING_PAYMENT',
      'WAITING_CONFIRMATION',
      'APPROVED',
      'REJECTED',
      'EXPIRED',
      'CANCELLED',
    ])
    .optional(),
  eventId: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
export type QueryOrderInput = z.infer<typeof queryOrderSchema>;

export const orderCodeParamSchema = z.object({
  orderCode: z.string().regex(/^ORD-\d{8}-[A-Z0-9]{4}$/, 'orderCode tidak valid'),
});
export type OrderCodeParam = z.infer<typeof orderCodeParamSchema>;
