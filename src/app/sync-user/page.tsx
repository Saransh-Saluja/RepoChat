import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/lib/db";

// Every sign-in / sign-up routes through here before reaching the app, so
// there's always a matching local User row before any project/question
// foreign key needs one. Idempotent — safe to hit on every login.
const SyncUserPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Your account has no email address on file");

  await db.user.upsert({
    where: { id: user.id },
    update: { email, name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(), imageUrl: user.imageUrl },
    create: {
      id: user.id,
      email,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      imageUrl: user.imageUrl,
    },
  });

  redirect("/dashboard");
};

export default SyncUserPage;
