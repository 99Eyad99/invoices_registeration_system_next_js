import { PrismaClient } from "@prisma/client";

// Reuse one client in development to avoid exhausting connections on hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// MongoDB IDs are 24-character hex strings; anything else (e.g. a mistyped URL) can't match an invoice.
export async function findInvoice(id: string) {
  if (!/^[0-9a-f]{24}$/i.test(id)) return null;
  return prisma.invoice.findUnique({ where: { id } });
}
