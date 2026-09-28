import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
