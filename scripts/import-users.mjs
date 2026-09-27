// Imports users from users.json into the database (creates new users, updates passwords of existing ones).
// Passwords are stored hashed (scrypt), never as plain text.
// Usage: npm run users:import   (users.json: [{ "username": "...", "password": "..." }])
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const users = JSON.parse(readFileSync(new URL("../users.json", import.meta.url), "utf8"));
const prisma = new PrismaClient();

for (const { username, password } of users) {
  if (!username || !password) {
    console.warn("Skipped an entry without username or password");
    continue;
  }
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash },
    update: { passwordHash },
  });
  console.log(`Saved user: ${username}`);
}

console.log(`Done. Users in database: ${await prisma.user.count()}`);
await prisma.$disconnect();
