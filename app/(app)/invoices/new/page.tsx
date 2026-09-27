import InvoiceForm from "./InvoiceForm";

export const dynamic = "force-dynamic";

export default function NewInvoicePage() {
  return <InvoiceForm maxFileSizeMb={Number(process.env.MAX_FILE_SIZE_MB || 10)} />;
}
