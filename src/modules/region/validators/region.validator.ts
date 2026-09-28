import { z } from 'zod';

export const queryRegencySchema = z.object({
  provinceCode: z.string().min(1, 'provinceCode wajib diisi'),
});

export type QueryRegencyInput = z.infer<typeof queryRegencySchema>;
