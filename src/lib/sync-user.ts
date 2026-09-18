import type { User } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function syncUser(user: User) {
  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated user does not have an email address");
  }

  return db.user.upsert({
    where: { clerkId: user.id },
    update: { email },
    create: {
      clerkId: user.id,
      email,
    },
  });
}
