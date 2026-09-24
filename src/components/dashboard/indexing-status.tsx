"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileCode2, RefreshCw } from "lucide-react";
import type { Project } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { indexProject } from "~/server/actions/projects";
import type { ProjectStatusResult } from "~/lib/use-project-status";

export function IndexingView({ project, status }: { project: Project; status: ProjectStatusResult }) {
  const total = status?.totalFiles ?? 0;
  const done = status?.indexedFiles ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const connecting = !status || (status.status === "PENDING" && total === 0);

  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="w-full max-w-md">
        <p className="mb-1 text-center text-xs uppercase tracking-[0.14em] text-muted/70">{project.name}</p>
        <h1 className="mb-8 text-center font-display text-xl font-medium">
          {connecting ? "Connecting to the repository…" : "Reading the codebase"}
        </h1>

        {!connecting && (
          <>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-mono text-ink">
                {done} / {total} files
              </span>
              <span className="font-mono text-muted">{percent}%</span>
            </div>
            <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}

        <div className="rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs text-muted">
            <FileCode2 className="size-3.5" />
            Recently indexed
          </div>
          <div className="min-h-[7.5rem] space-y-2 px-4 py-3 font-mono text-[13px]">
            {connecting && <p className="text-muted/50">waiting for GitHub…</p>}
            {!connecting && (status?.recentFiles?.length ?? 0) === 0 && (
              <p className="text-muted/50">summarizing first file…</p>
            )}
            {status?.recentFiles?.map((file: string, i: number) => (
              <p
                key={file}
                className="animate-reveal truncate text-muted"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-diff-add">✓</span> {file}
              </p>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted/60">
          Each file is summarized and embedded individually — larger repos take a few minutes.
        </p>
      </div>
    </div>
  );
}

export function FailedView({ project }: { project: Project }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await indexProject({ projectId: project.id, githubUrl: project.githubUrl });
      router.refresh();
    } catch {
      // status is already reflected as FAILED server-side; refresh shows the latest error
      router.refresh();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-diff-del/10">
          <AlertTriangle className="size-5 text-diff-del" />
        </div>
        <h1 className="mb-2 font-display text-xl font-medium">Indexing failed</h1>
        <p className="mb-6 text-sm text-muted">{project.indexingError ?? "Something went wrong while reading this repository."}</p>
        <Button onClick={retry} disabled={retrying} variant="outline">
          <RefreshCw className={retrying ? "size-4 animate-spin" : "size-4"} />
          {retrying ? "Retrying…" : "Retry indexing"}
        </Button>
      </div>
    </div>
  );
}
