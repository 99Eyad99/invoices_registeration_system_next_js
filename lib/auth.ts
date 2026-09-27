import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken, verifySessionToken } from "./session";

// Passwords are stored as "salt:hash" (hex, scrypt). See scripts/import-users.mjs.
const DUMMY_HASH = "00000000000000000000000000000000:" + "0".repeat(128);

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash ?? "", "hex");
  const actual = scryptSync(password, salt ?? "", 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function checkCredentials(username: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { username } });
  // Always hash once so response time doesn't reveal whether the username exists.
  const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return ok && !!user;
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
