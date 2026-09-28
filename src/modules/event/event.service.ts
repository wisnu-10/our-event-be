import type { Event, EventStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma-client.config';
import { generateUniqueSlug } from '../../helpers/slug.helper';
import { parsePagination, buildMeta } from '../../helpers/pagination.helper';
import AppError from '../../helpers/app-error.helper';
import type {
  CreateEventInput,
  PublishEventInput,
  QueryEventInput,
  UpdateEventInput,
} from './validators/event.validator';

export interface EventListFilter {
  adminId?: string;
  statuses?: EventStatus[];
  category?: string;
  location?: string;
  provinceCode?: string;
  regencyCode?: string;
  search?: string;
  from?: Date;
  to?: Date;
  excludeExpired?: boolean;
  skip: number;
  take: number;
}

export type EventWithQuota = Event & { remainingQuota: number };

function buildWhere(f: EventListFilter): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = { deletedAt: null };
  if (f.adminId) where.adminId = f.adminId;
  if (f.statuses) where.status = { in: f.statuses };
  if (f.category) where.category = f.category;
  if (f.location) where.location = { contains: f.location, mode: 'insensitive' };
  if (f.provinceCode) where.provinceCode = f.provinceCode;
  if (f.regencyCode) where.regencyCode = f.regencyCode;
  if (f.search) {
    where.OR = [
      { title: { contains: f.search, mode: 'insensitive' } },
      { description: { contains: f.search, mode: 'insensitive' } },
    ];
  }
  if (f.from || f.to) {
    where.startDate = {};
    if (f.from) where.startDate.gte = f.from;
    if (f.to) where.startDate.lte = f.to;
  }
  if (f.excludeExpired) where.endDate = { gt: new Date() };
  return where;
}

function composeLocation(input: {
  addressDetail: string;
  regencyType: string;
  regency: string;
  province: string;
}): string {
  return `${input.addressDetail}, ${input.regencyType} ${input.regency}, ${input.province}`;
}

const ACTIVE_ORDER_STATUSES = ['PENDING_PAYMENT', 'WAITING_CONFIRMATION', 'APPROVED'] as const;

async function countActiveOrders(eventId: string): Promise<number> {
  return prisma.order.count({
    where: {
      eventId,
      status: { in: [...ACTIVE_ORDER_STATUSES] },
      NOT: { status: 'PENDING_PAYMENT', expiresAt: { lt: new Date() } },
    },
  });
}

export async function sumSoldQuantities(eventIds: string[]): Promise<Map<string, number>> {
  if (eventIds.length === 0) return new Map();
  const now = new Date();
  const groups = await prisma.order.groupBy({
    by: ['eventId'],
    where: {
      eventId: { in: eventIds },
      OR: [
        { status: { in: ['WAITING_CONFIRMATION', 'APPROVED'] } },
        { status: 'PENDING_PAYMENT', expiresAt: { gt: now } },
      ],
    },
    _sum: { quantity: true },
  });
  return new Map(groups.map((g) => [g.eventId, g._sum.quantity ?? 0]));
}

async function withQuota(events: Event[]): Promise<EventWithQuota[]> {
  const sold = await sumSoldQuantities(events.map((e) => e.id));
  return events.map((e) => ({ ...e, remainingQuota: e.quota - (sold.get(e.id) ?? 0) }));
}

async function ownedEvent(id: string, adminId: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.deletedAt) throw AppError('Event tidak ditemukan', 404);
  if (event.adminId !== adminId) throw AppError('Bukan event milikmu', 403);
  return event;
}

async function assertNoActiveOrders(eventId: string) {
  const count = await countActiveOrders(eventId);
  if (count > 0) {
    throw AppError('Event sudah memiliki order aktif, tidak bisa diubah/dihapus', 409);
  }
}

export const eventService = {
  async create(input: CreateEventInput, adminId: string) {
    const slugExists = async (slug: string) =>
      (await prisma.event.findUnique({ where: { slug }, select: { id: true } })) !== null;
    const slug = await generateUniqueSlug(input.title, slugExists);
    return prisma.event.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        location: composeLocation(input),
        provinceCode: input.provinceCode,
        province: input.province,
        regencyCode: input.regencyCode,
        regency: input.regency,
        regencyType: input.regencyType,
        addressDetail: input.addressDetail,
        category: input.category,
        startDate: input.startDate,
        endDate: input.endDate,
        price: input.price,
        quota: input.quota,
        bannerUrl: input.bannerUrl || null,
        status: 'DRAFT',
        adminId,
      },
    });
  },

  async listPublic(query: QueryEventInput) {
    const { page, limit, skip } = parsePagination(query);
    const filter: EventListFilter = {
      statuses: ['PUBLISHED'],
      category: query.category,
      location: query.location,
      provinceCode: query.provinceCode,
      regencyCode: query.regencyCode,
      search: query.search,
      from: query.from,
      to: query.to,
      excludeExpired: true,
      skip,
      take: limit,
    };
    const where = buildWhere(filter);
    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({ where, orderBy: { startDate: 'asc' }, skip, take: limit }),
    ]);
    return { items: await withQuota(events), meta: buildMeta(page, limit, total) };
  },

  async listMine(adminId: string, query: QueryEventInput) {
    const { page, limit, skip } = parsePagination(query);
    const filter: EventListFilter = {
      adminId,
      statuses: query.status ? [query.status] : undefined,
      search: query.search,
      skip,
      take: limit,
    };
    const where = buildWhere(filter);
    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({ where, orderBy: { startDate: 'asc' }, skip, take: limit }),
    ]);
    return { items: await withQuota(events), meta: buildMeta(page, limit, total) };
  },

  async detailBySlug(slug: string, viewer?: { id: string; role: string }) {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event || event.deletedAt) throw AppError('Event tidak ditemukan', 404);
    const isOwner = viewer?.id === event.adminId;
    const visible = event.status === 'PUBLISHED' && event.endDate > new Date();
    if (!visible && !isOwner) throw AppError('Event tidak ditemukan', 404);
    const [item] = await withQuota([event]);
    return item;
  },

  async update(id: string, adminId: string, input: UpdateEventInput) {
    await ownedEvent(id, adminId);
    await assertNoActiveOrders(id);
    const sold = await sumSoldQuantities([id]);
    if (input.quota < (sold.get(id) ?? 0)) {
      throw AppError('Kuota baru lebih kecil dari tiket yang sudah terjual', 409);
    }
    return prisma.event.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        location: composeLocation(input),
        provinceCode: input.provinceCode,
        province: input.province,
        regencyCode: input.regencyCode,
        regency: input.regency,
        regencyType: input.regencyType,
        addressDetail: input.addressDetail,
        category: input.category,
        startDate: input.startDate,
        endDate: input.endDate,
        price: input.price,
        quota: input.quota,
        bannerUrl: input.bannerUrl || null,
      },
    });
  },

  async remove(id: string, adminId: string) {
    await ownedEvent(id, adminId);
    await assertNoActiveOrders(id);
    return prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async publish(id: string, adminId: string, input: PublishEventInput) {
    await ownedEvent(id, adminId);
    return prisma.event.update({ where: { id }, data: { status: input.status } });
  },
};
