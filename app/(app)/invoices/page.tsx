import { prisma } from "@/lib/db";
import { toInvoiceRow } from "@/lib/format";
import InvoiceList from "./InvoiceList";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();

  const invoices = await prisma.invoice.findMany({
    where: q
      ? {
          OR: [
            { invoiceNumber: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return <InvoiceList invoices={invoices.map(toInvoiceRow)} query={q} />;
}
