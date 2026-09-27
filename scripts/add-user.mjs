// Adds a user to the database, or changes the password if the username already exists.
// Usage: npm run users:add -- <username> <password>
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: npm run users:add -- <username> "<password>"');
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

const prisma = new PrismaClient();
const existing = await prisma.user.findUnique({ where: { username } });
await prisma.user.upsert({ where: { username }, create: { username, passwordHash }, update: { passwordHash } });
console.log(existing ? `Password updated for: ${username}` : `User added: ${username}`);
await prisma.$disconnect();
