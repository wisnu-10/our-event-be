import { prisma } from '../../config/prisma-client.config';
import { Prisma } from '@prisma/client';
import { ORDER_EXPIRY_HOURS } from '../../config/main.config';
import { generateOrderCode } from '../../helpers/code.helper';
import { sumSoldQuantities } from '../event/event.service';
import { orderCodeExists } from '../ticket/ticket.service';
import { ticketService } from '../ticket/ticket.service';
import { uploadToCloudinary } from '../../helpers/upload.helper';
import { parsePagination, buildMeta } from '../../helpers/pagination.helper';
import AppError from '../../helpers/app-error.helper';
import type {
  CreateOrderInput,
  QueryOrderInput,
  RejectOrderInput,
} from './validators/order.validator';

async function uniqueOrderCode(): Promise<string> {
  let code = generateOrderCode();
  while (await orderCodeExists(code)) {
    code = generateOrderCode();
  }
  return code;
}

async function ownedOrder(orderCode: string, userId: string, admin = false) {
  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: { event: true, user: { select: { id: true, name: true, email: true } }, tickets: true },
  });
  if (!order || order.deletedAt) throw AppError('Order tidak ditemukan', 404);
  if (!admin && order.userId !== userId) throw AppError('Bukan order milikmu', 403);
  return order;
}

export const orderService = {
  async create(userId: string, input: CreateOrderInput) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: input.eventId } });
      if (!event || event.deletedAt || event.status !== 'PUBLISHED' || event.endDate <= new Date()) {
        throw AppError('Event tidak tersedia', 404);
      }
      const sold = await sumSoldQuantities([event.id]);
      const remaining = event.quota - (sold.get(event.id) ?? 0);
      if (input.quantity > remaining) {
        throw AppError(`Sisa kuota tidak cukup (tersisa ${remaining})`, 409);
      }
      const totalPrice = new Prisma.Decimal(event.price.toString()).mul(input.quantity);
      const expiresAt = new Date(Date.now() + ORDER_EXPIRY_HOURS * 3600 * 1000);
      return tx.order.create({
        data: {
          orderCode: await uniqueOrderCode(),
          userId,
          eventId: event.id,
          quantity: input.quantity,
          totalPrice,
          status: 'PENDING_PAYMENT',
          expiresAt,
        },
        include: { event: true },
      });
    });
  },

  async detail(orderCode: string, userId: string, isAdmin: boolean) {
    return ownedOrder(orderCode, userId, isAdmin);
  },

  async listMine(userId: string, query: QueryOrderInput) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.OrderWhereInput = { userId, deletedAt: null };
    if (query.status) where.status = query.status;
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { event: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async listAll(query: QueryOrderInput) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.OrderWhereInput = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.eventId) where.eventId = query.eventId;
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          event: { select: { id: true, title: true, slug: true, price: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async uploadProof(orderCode: string, userId: string, buffer: Buffer) {
    const order = await ownedOrder(orderCode, userId);
    const canUpload =
      order.status === 'PENDING_PAYMENT' ||
      (order.status === 'REJECTED' && order.reuploadCount < 1);
    if (!canUpload) {
      throw AppError('Order ini tidak bisa upload bukti bayar', 409);
    }
    if (order.status === 'PENDING_PAYMENT' && order.expiresAt < new Date()) {
      throw AppError('Order sudah kedaluwarsa', 409);
    }
    const proofImageUrl = await uploadToCloudinary(buffer, 'proofs');
    return prisma.order.update({
      where: { id: order.id },
      data: {
        proofImageUrl,
        status: 'WAITING_CONFIRMATION',
        reuploadCount: order.status === 'REJECTED' ? { increment: 1 } : undefined,
        rejectionNote: null,
      },
      include: { event: true },
    });
  },

  async cancel(orderCode: string, userId: string) {
    const order = await ownedOrder(orderCode, userId);
    if (order.status !== 'PENDING_PAYMENT') {
      throw AppError('Hanya order PENDING_PAYMENT yang bisa dibatalkan', 409);
    }
    return prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } },
        tickets: true,
      },
    });
  },

  async approve(orderCode: string) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { orderCode } });
      if (!order || order.deletedAt) throw AppError('Order tidak ditemukan', 404);
      if (order.status !== 'WAITING_CONFIRMATION') {
        throw AppError('Hanya order WAITING_CONFIRMATION yang bisa disetujui', 409);
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'APPROVED' },
      });
      await ticketService.createTicketsForOrder(tx, order.id, order.quantity);
    });
    return ownedOrder(orderCode, '', true);
  },

  async reject(orderCode: string, input: RejectOrderInput) {
    const order = await prisma.order.findUnique({ where: { orderCode } });
    if (!order || order.deletedAt) throw AppError('Order tidak ditemukan', 404);
    if (order.status !== 'WAITING_CONFIRMATION') {
      throw AppError('Hanya order WAITING_CONFIRMATION yang bisa ditolak', 409);
    }
    return prisma.order.update({
      where: { id: order.id },
      data: { status: 'REJECTED', rejectionNote: input.rejectionNote },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } },
        tickets: true,
      },
    });
  },

  async expirePendingOrders(): Promise<number> {
    const result = await prisma.order.updateMany({
      where: { status: 'PENDING_PAYMENT', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
    return result.count;
  },

  startExpiryJob(intervalMs = 10 * 60 * 1000) {
    const run = () => {
      orderService.expirePendingOrders().catch((e) => {
        // eslint-disable-next-line no-console
        console.error('[expiry-job]', e);
      });
    };
    const timer = setInterval(run, intervalMs);
    if (typeof timer.unref === 'function') timer.unref();
    return timer;
  },
};
