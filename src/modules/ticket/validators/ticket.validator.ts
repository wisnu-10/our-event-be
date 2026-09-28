import { z } from 'zod';

export const orderCodeParamSchema = z.object({
  orderCode: z.string().min(1, 'orderCode tidak valid'),
});

export type OrderCodeParam = z.infer<typeof orderCodeParamSchema>;
