import { notFound } from "next/navigation";
import { getProjectOverview } from "~/server/actions/projects";
import { ProjectWorkspace } from "~/components/dashboard/project-workspace";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  let data: Awaited<ReturnType<typeof getProjectOverview>>;
  try {
    data = await getProjectOverview(projectId);
  } catch {
    notFound();
  }

  return (
    <ProjectWorkspace
      project={data.project}
      languageBreakdown={data.languageBreakdown}
      indexedFileCount={data.indexedFileCount}
    />
  );
}
