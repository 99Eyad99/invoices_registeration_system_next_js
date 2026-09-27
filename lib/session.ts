// Signed session token: base64url(payload).base64url(HMAC-SHA256(payload)).
// Uses Web Crypto only, so it works in proxy.ts as well as in server code.

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60; // 2 hours, measured from login

// Where to go after login. Only local paths are allowed, to avoid redirecting to another site.
export function safeRedirectPath(from: string | null | undefined): string {
  return from && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : "/invoices";
}

type SessionPayload ={ username: string; exp: number };

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

async function sign(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (at least 32 characters)");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data))));
}

export async function createSessionToken(username: string): Promise<string> {
  const payload: SessionPayload = { username, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 };
  const data = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${data}.${await sign(data)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  // Compare signatures in constant time.
  const expected = await sign(data);
  if (expected.length !== signature.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (diff !== 0) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}
