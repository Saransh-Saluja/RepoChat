import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/lib/sync-user";

export default async function DashboardPage() {
  const user = await currentUser();

  if (user) {
    await syncUser(user);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}.</p>
      <p>Your RepoPilot workspace will be built here.</p>
    </main>
  );
}
