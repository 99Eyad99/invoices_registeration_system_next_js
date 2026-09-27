"use server";

import { redirect } from "next/navigation";
import { checkCredentials, endSession, startSession } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/session";

export async function login(username: string, password: string, from: string): Promise<{ error: string }> {
  if (!checkCredentials(username.trim(), password)) {
    return { error: "Invalid username or password." };
  }
  await startSession(username.trim());
  redirect(safeRedirectPath(from));
}

export async function logout() {
  await endSession();
  redirect("/login");
}
