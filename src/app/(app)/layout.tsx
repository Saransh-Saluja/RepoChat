import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/lib/db";
import { getProjects } from "~/server/actions/projects";
import { AppShell } from "~/components/dashboard/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Safety net: guarantees a local User row exists before any child page runs
  // a mutation that depends on one, regardless of how the session was created.
  const existingUser = await db.user.findUnique({ where: { id: userId } });
  if (!existingUser) redirect("/sync-user");

  const projects = await getProjects();

  return <AppShell projects={projects}>{children}</AppShell>;
}
