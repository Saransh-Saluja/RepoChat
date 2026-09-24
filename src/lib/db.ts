import { PrismaClient } from "@prisma/client";

// Standard Next.js pattern: reuse one PrismaClient across hot reloads in dev
// so we don't exhaust the connection pool every time a file changes.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
