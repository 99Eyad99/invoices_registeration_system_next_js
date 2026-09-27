"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/drive";

export type CreateInvoiceResult = { ok: true; invoiceId: string; message: string } | { ok: false; message: string };

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function createInvoice(formData: FormData): Promise<CreateInvoiceResult> {
  await requireSession();

  const invoiceNumber = String(formData.get("invoiceNumber") ?? "").trim();
  const endDateValue = String(formData.get("endDate") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
  const file = formData.get("file");

  // 1. Validate
  const maxMb = Number(process.env.MAX_FILE_SIZE_MB || 10);
  if (!invoiceNumber) return error("Invoice Number is required.");
  if (!(file instanceof File) || file.size === 0) return error("Invoice File is required.");
  if (!ALLOWED_TYPES.includes(file.type)) return error("Only PDF, JPG and PNG files are supported.");
  if (file.size > maxMb * 1024 * 1024) return error(`File is too large. Maximum size is ${maxMb} MB.`);

  let endDate: Date | null = null;
  if (endDateValue) {
    endDate = new Date(`${endDateValue}T00:00:00Z`);
    if (isNaN(endDate.getTime())) return error("End Date is not a valid date.");
  }

  const existing = await prisma.invoice.findFirst({ where: { invoiceNumber } });
  if (existing) return error(`Invoice number "${invoiceNumber}" already exists.`);

  // 2. Upload to Google Drive
  let fileId: string;
  try {
    fileId = await uploadFile(file);
  } catch (e) {
    console.error("Google Drive upload failed:", e);
    return error("Uploading the file to Google Drive failed. Please try again.");
  }

  // 3. Save metadata (remove the uploaded file if this fails, so Drive has no orphans)
  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        endDate,
        description: description || null,
        tags: tags || null,
        fileId,
        fileName: file.name,
        mimeType: file.type,
      },
    });
    revalidatePath("/invoices");
    return { ok: true, invoiceId: invoice.id, message: `Invoice ${invoiceNumber} was uploaded successfully.` };
  } catch (e) {
    console.error("Saving invoice failed:", e);
    await deleteFile(fileId).catch(() => {});
    return error("Saving the invoice failed. Please try again.");
  }
}

function error(message: string): CreateInvoiceResult {
  return { ok: false, message };
}
