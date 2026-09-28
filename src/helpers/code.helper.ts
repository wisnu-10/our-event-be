import crypto from 'crypto';

function randomPart(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

export function generateOrderCode(date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${ymd}-${randomPart(4)}`;
}

export function generateTicketCode(): string {
  return `TIX-${randomPart(8)}`;
}
