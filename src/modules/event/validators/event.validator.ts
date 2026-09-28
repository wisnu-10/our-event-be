import { z } from 'zod';

const base = {
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  provinceCode: z.string().min(1, 'Provinsi wajib dipilih'),
  province: z.string().min(1, 'Provinsi wajib dipilih'),
  regencyCode: z.string().min(1, 'Kota/Kabupaten wajib dipilih'),
  regency: z.string().min(1, 'Kota/Kabupaten wajib dipilih'),
  regencyType: z.enum(['Kota', 'Kabupaten']).optional().default('Kota'),
  addressDetail: z.string().min(5, 'Detail alamat/venue minimal 5 karakter'),
  category: z.string().min(1).default('general'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  price: z.coerce.number().min(0, 'Harga minimal 0'),
  quota: z.coerce.number().int().min(1, 'Kuota minimal 1'),
  bannerUrl: z.string().url('Banner harus URL valid').optional().or(z.literal('')),
};

function dateOrder<T extends { startDate: Date; endDate: Date }>(schema: z.ZodType<T>) {
  return schema.refine((v) => v.endDate > v.startDate, {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  });
}

export const createEventSchema = dateOrder(z.object(base));
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = dateOrder(z.object({ ...base }));
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const publishEventSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']),
});
export type PublishEventInput = z.infer<typeof publishEventSchema>;

export const queryEventSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  provinceCode: z.string().optional(),
  regencyCode: z.string().optional(),
  search: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  mine: z.coerce.boolean().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
export type QueryEventInput = z.infer<typeof queryEventSchema>;

export const slugParamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug tidak valid'),
});
export type SlugParam = z.infer<typeof slugParamSchema>;

export const idParamSchema = z.object({
  id: z.string().min(1),
});
export type IdParam = z.infer<typeof idParamSchema>;
