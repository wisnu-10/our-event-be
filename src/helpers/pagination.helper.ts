export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePagination(query: { page?: unknown; limit?: unknown }): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit ?? 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
