"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "~/lib/db";
import { fetchRepoFiles, getRepoMeta } from "~/lib/github";
import { summariseFile, embedText } from "~/lib/ai";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function createProject(input: { name: string; githubUrl: string; githubToken?: string }) {
  const userId = await requireUserId();
  const meta = await getRepoMeta(input.githubUrl, input.githubToken).catch(() => null);

  const project = await db.project.create({
    data: {
      name: input.name,
      githubUrl: input.githubUrl,
      ownerId: userId,
      description: meta?.description ?? null,
      primaryLanguage: meta?.primaryLanguage ?? null,
      status: "PENDING",
    },
  });
  revalidatePath("/dashboard");
  return project;
}

// Long-running. Call right after createProject — the client polls getProjectStatus
// while this is in flight to render real per-file progress.
export async function indexProject(input: { projectId: string; githubUrl: string; githubToken?: string }) {
  const userId = await requireUserId();
  const project = await db.project.findFirst({ where: { id: input.projectId, ownerId: userId } });
  if (!project) throw new Error("Project not found");

  try {
    await db.project.update({
      where: { id: input.projectId },
      data: { status: "INDEXING", indexedFiles: 0, indexingError: null },
    });

    const files = await fetchRepoFiles(input.githubUrl, input.githubToken);
    if (files.length === 0) {
      throw new Error("No indexable source files found in this repo (check the URL, branch, or that it isn't empty)");
    }

    await db.project.update({ where: { id: input.projectId }, data: { totalFiles: files.length } });

    let processed = 0;
    for (const file of files) {
      try {
        const summary = await summariseFile(file);
        if (summary) {
          const embedding = await embedText(summary);
          const record = await db.fileEmbedding.create({
            data: {
              projectId: input.projectId,
              fileName: file.path,
              extension: file.extension,
              sourceCode: file.content.slice(0, 50_000),
              summary,
            },
          });
          const vectorLiteral = `[${embedding.join(",")}]`;
          await db.$executeRaw`UPDATE "FileEmbedding" SET "embedding" = ${vectorLiteral}::vector WHERE id = ${record.id}`;
        }
      } catch (fileError) {
        console.error(`Failed to index ${file.path}:`, fileError);
      }

      processed++;
      await db.project.update({ where: { id: input.projectId }, data: { indexedFiles: processed } });

      // Stay under the embedding API's rate limit
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    await db.project.update({ where: { id: input.projectId }, data: { status: "READY" } });
  } catch (error) {
    await db.project.update({
      where: { id: input.projectId },
      data: { status: "FAILED", indexingError: error instanceof Error ? error.message : "Unknown error while indexing" },
    });
    throw error;
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getProjectStatus(projectId: string) {
  const userId = await requireUserId();
  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { status: true, totalFiles: true, indexedFiles: true, indexingError: true },
  });
  if (!project) return null;

  const recentFiles = await db.fileEmbedding.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { fileName: true },
  });

  return { ...project, recentFiles: recentFiles.map((f: { fileName: string }) => f.fileName) };
}

export async function getProjects() {
  const userId = await requireUserId();
  return db.project.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" } });
}

export async function deleteProject(projectId: string) {
  const userId = await requireUserId();
  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) throw new Error("Project not found");
  await db.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
}

export async function getProjectOverview(projectId: string) {
  const userId = await requireUserId();
  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) throw new Error("Project not found");

  const files = await db.fileEmbedding.findMany({ where: { projectId }, select: { extension: true } });
  const counts = new Map<string, number>();
  for (const file of files) {
    const key = file.extension && file.extension.length > 0 ? file.extension : "other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const languageBreakdown = Array.from(counts.entries())
    .map(([extension, count]) => ({ extension, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { project, languageBreakdown, indexedFileCount: files.length };
}
