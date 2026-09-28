import QRCode from 'qrcode';
import { prisma } from '../../config/prisma-client.config';
import { generateTicketCode } from '../../helpers/code.helper';
import { isCloudinaryConfigured } from '../../config/main.config';
import { uploadToCloudinary } from '../../helpers/upload.helper';
import AppError from '../../helpers/app-error.helper';
import type { Prisma } from '@prisma/client';

async function ticketCodeExists(ticketCode: string): Promise<boolean> {
  const t = await prisma.ticket.findUnique({ where: { ticketCode }, select: { id: true } });
  return t !== null;
}

export async function orderCodeExists(orderCode: string): Promise<boolean> {
  const o = await prisma.order.findUnique({ where: { orderCode }, select: { id: true } });
  return o !== null;
}

async function uniqueTicketCode(): Promise<string> {
  let code = generateTicketCode();
  while (await ticketCodeExists(code)) {
    code = generateTicketCode();
  }
  return code;
}

async function qrUrlFor(ticketCode: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(ticketCode, { width: 256, margin: 1 });
  if (!isCloudinaryConfigured) return dataUrl;
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
  return uploadToCloudinary(buffer, 'tickets');
}

export const ticketService = {
  async createTicketsForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    quantity: number,
  ): Promise<void> {
    const rows = [];
    for (let i = 0; i < quantity; i++) {
      const ticketCode = await uniqueTicketCode();
      rows.push({ ticketCode, orderId, qrCodeUrl: await qrUrlFor(ticketCode) });
    }
    await tx.ticket.createMany({ data: rows });
  },

  async listByOrder(orderCode: string, userId: string, isAdmin: boolean) {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { tickets: true },
    });
    if (!order || order.deletedAt) throw AppError('Order tidak ditemukan', 404);
    if (!isAdmin && order.userId !== userId) throw AppError('Bukan order milikmu', 403);
    return order.tickets;
  },
};
