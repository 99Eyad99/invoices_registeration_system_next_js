import { notFound } from "next/navigation";
import { findInvoice } from "@/lib/db";
import { toInvoiceRow } from "@/lib/format";
import InvoiceDetails from "./InvoiceDetails";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await findInvoice(id);
  if (!invoice) notFound();

  return <InvoiceDetails invoice={toInvoiceRow(invoice)} />;
}
