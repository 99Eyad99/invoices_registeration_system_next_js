import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import users from "@/users.json";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken, verifySessionToken } from "./session";

function sameText(a: string, b: string): boolean {
  // Hash first so both buffers have equal length for timingSafeEqual.
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export function checkCredentials(username: string, password: string): boolean {
  const user = users.find((u) => u.username === username);
  // Always run a comparison so response time doesn't reveal whether the username exists.
  return sameText(password, user?.password ?? "") && !!user;
}

export async function startSession(username: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

// Use in pages, server actions and route handlers. proxy.ts already guards every route; this is a second check.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
