"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Plus, GitBranch } from "lucide-react";
import Image from "next/image";
import type { Project } from "@prisma/client";
import { cn } from "~/lib/utils";
import { NewProjectDialog } from "./new-project-dialog";

export function AppShell({
  projects,
  children,
}: {
  projects: Project[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 border-b border-border px-5 py-4"
        >
          <Image
            src="/download (2).png"
            alt="RepoPilot"
            width={80}
            height={80}
            className="object-contain"
          />

          
        </Link>

        {/* New project */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setDialogOpen(true)}
            className="flex w-full items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-ink"
          >
            <Plus className="size-4" />
            Index a repo
          </button>
        </div>

        {/* Projects */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {projects.length === 0 && (
            <p className="px-3 py-6 text-center text-xs leading-relaxed text-muted/70">
              No repos yet — index one to get started.
            </p>
          )}

          {projects.map((project) => {
            const active = pathname === `/dashboard/${project.id}`;

            return (
              <Link
                key={project.id}
                href={`/dashboard/${project.id}`}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface-2 text-ink"
                    : "text-muted hover:bg-surface-2/60 hover:text-ink",
                )}
              >
                <StatusDot status={project.status} />
                <span className="truncate">{project.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Account */}
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-muted">Account</span>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "INDEXING" || status === "PENDING") {
    return (
      <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
    );
  }

  if (status === "FAILED") {
    return (
      <span className="size-1.5 shrink-0 rounded-full bg-diff-del" />
    );
  }

  return (
    <GitBranch
      className="size-3.5 shrink-0 text-muted/60"
      strokeWidth={2}
    />
  );
}