"use client";

import { useState } from "react";
import { Compass, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { NewProjectDialog } from "~/components/dashboard/new-project-dialog";

export default function DashboardIndexPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full border border-border bg-surface">
          <Compass className="size-5 text-accent" strokeWidth={1.75} />
        </div>
        <h1 className="mb-2 font-display text-xl font-medium">No repo selected</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          Index a GitHub repository and RepoPilot will read every file, so you&apos;re not starting from zero.
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Index a repo
        </Button>
      </div>
      <NewProjectDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
