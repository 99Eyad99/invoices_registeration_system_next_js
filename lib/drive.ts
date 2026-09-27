import "server-only";
import { Readable } from "node:stream";
import { auth, drive as googleDrive } from "@googleapis/drive";

// All Google Drive access lives here. This module is server-only, so credentials never reach the browser.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// Acts as the dedicated Google account that authorized the app (see scripts/google-auth.mjs).
// The client refreshes access tokens automatically using the stored refresh token.
function getDrive() {
  const client = new auth.OAuth2(requireEnv("GOOGLE_CLIENT_ID"), requireEnv("GOOGLE_CLIENT_SECRET"));
  client.setCredentials({ refresh_token: requireEnv("GOOGLE_REFRESH_TOKEN") });
  return googleDrive({ version: "v3", auth: client });
}

export async function uploadFile(file: File): Promise<string> {
  const res = await getDrive().files.create({
    requestBody: { name: file.name, parents: [requireEnv("GOOGLE_DRIVE_FOLDER_ID")] },
    media: {
      mimeType: file.type,
      body: Readable.from(Buffer.from(await file.arrayBuffer())),
    },
    fields: "id",
    supportsAllDrives: true,
  });
  if (!res.data.id) throw new Error("Google Drive did not return a file ID");
  return res.data.id;
}

export async function downloadFile(fileId: string): Promise<ArrayBuffer> {
  const res = await getDrive().files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );
  return res.data as unknown as ArrayBuffer;
}

export async function deleteFile(fileId: string): Promise<void> {
  await getDrive().files.delete({ fileId, supportsAllDrives: true });
}
