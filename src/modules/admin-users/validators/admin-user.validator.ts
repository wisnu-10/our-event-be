import { z } from 'zod';

export const createAdminUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['ADMIN', 'CUSTOMER']).default('ADMIN'),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export const queryAdminUserSchema = z.object({
  role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type QueryAdminUserInput = z.infer<typeof queryAdminUserSchema>;

export const adminUserIdParamSchema = z.object({
  id: z.string().min(1, 'id tidak valid'),
});

export const updateAdminUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'CUSTOMER']),
});

export type UpdateAdminUserRoleInput = z.infer<typeof updateAdminUserRoleSchema>;
