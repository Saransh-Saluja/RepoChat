import { UserButton } from "@clerk/nextjs";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <strong>RepoPilot</strong>
        <UserButton />
      </header>
      {children}
    </div>
  );
}
