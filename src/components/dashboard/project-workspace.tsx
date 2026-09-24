"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { Project } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { useProjectStatus } from "~/lib/use-project-status";
import { IndexingView, FailedView } from "./indexing-status";
import { OverviewTab } from "./overview-tab";
import { AskAiTab } from "./ask-ai-tab";
import { SearchTab } from "./search-tab";
import { HistoryTab } from "./history-tab";

type LanguageBreakdown = { extension: string; count: number }[];

export function ProjectWorkspace({
  project,
  languageBreakdown,
  indexedFileCount,
}: {
  project: Project;
  languageBreakdown: LanguageBreakdown;
  indexedFileCount: number;
}) {
  const router = useRouter();
  const stillWorking = project.status === "PENDING" || project.status === "INDEXING";
  const liveStatus = useProjectStatus(project.id, stillWorking);

  useEffect(() => {
    if (liveStatus?.status === "READY" || liveStatus?.status === "FAILED") {
      router.refresh();
    }
  }, [liveStatus?.status, router]);

  if (stillWorking) return <IndexingView project={project} status={liveStatus} />;
  if (project.status === "FAILED") return <FailedView project={project} />;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium">{project.name}</h1>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mono text-[13px] text-muted transition-colors hover:text-accent"
          >
            {project.githubUrl.replace("https://", "")}
            <ExternalLink className="size-3" />
          </a>
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="mb-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ask">Ask AI</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab project={project} languageBreakdown={languageBreakdown} indexedFileCount={indexedFileCount} />
        </TabsContent>
        <TabsContent value="ask">
          <AskAiTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="search">
          <SearchTab projectId={project.id} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
