import type { Invoice } from "@prisma/client";

// Plain, serializable invoice shape passed from server pages to client components.
export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  endDate: string; // formatted, or "—"
  description: string;
  tags: string[];
  fileName: string;
  mimeType: string;
  createdAt: string; // formatted
};

// End dates are stored as UTC midnight, so format in UTC to avoid showing the previous day.
function formatDate(date: Date | null, utc = false): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(utc ? { timeZone: "UTC" } : {}),
  });
}

export function toInvoiceRow(invoice: Invoice): InvoiceRow {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    endDate: formatDate(invoice.endDate, true),
    description: invoice.description ?? "",
    tags: invoice.tags ? invoice.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    fileName: invoice.fileName,
    mimeType: invoice.mimeType,
    createdAt: formatDate(invoice.createdAt),
  };
}
