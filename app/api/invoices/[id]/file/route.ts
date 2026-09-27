import { getSession } from "@/lib/auth";
import { findInvoice } from "@/lib/db";
import { downloadFile } from "@/lib/drive";

// Streams the invoice file from Google Drive through the server, so the browser never needs Drive access.
// ?download=1 forces a download; otherwise the file is shown inline (preview).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const invoice = await findInvoice(id);
  if (!invoice) return new Response("Invoice not found", { status: 404 });

  try {
    const data = await downloadFile(invoice.fileId);
    const download = new URL(request.url).searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";

    return new Response(data, {
      headers: {
        "Content-Type": invoice.mimeType,
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(invoice.fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Failed to fetch file from Google Drive:", error);
    return new Response("Could not load the file from Google Drive", { status: 502 });
  }
}
