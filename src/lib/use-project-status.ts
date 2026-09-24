"use client";

import { useEffect, useState } from "react";
import { getProjectStatus } from "~/server/actions/projects";

export type ProjectStatusResult = Awaited<ReturnType<typeof getProjectStatus>>;

// Polls real numbers from the DB while indexing is active. Stops itself once
// the run reaches a terminal state so it doesn't poll forever on a finished project.
export function useProjectStatus(projectId: string, active: boolean) {
  const [status, setStatus] = useState<ProjectStatusResult>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function poll() {
      const result = await getProjectStatus(projectId);
      if (!cancelled) setStatus(result);
    }

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId, active]);

  return status;
}
