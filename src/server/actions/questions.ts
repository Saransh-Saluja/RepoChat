"use server";

import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { db } from "~/lib/db";
import { embedText, google, CHAT_MODEL } from "~/lib/ai";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export type FileReference = { fileName: string; sourceCode: string; summary: string };

// Two-phase: file references come back immediately (fast vector search),
// the answer streams in separately — lets the UI show "found N files" before
// the model has generated a single token.
export async function askQuestion(projectId: string, question: string) {
  await requireUserId();
  const stream = createStreamableValue("");

  const queryVector = await embedText(question);
  const vectorLiteral = `[${queryVector.join(",")}]`;

  const matches = await db.$queryRaw<FileReference[]>`
    SELECT "fileName", "sourceCode", "summary",
      1 - ("embedding" <=> ${vectorLiteral}::vector) AS similarity
    FROM "FileEmbedding"
    WHERE "projectId" = ${projectId}
      AND 1 - ("embedding" <=> ${vectorLiteral}::vector) > 0.5
    ORDER BY similarity DESC
    LIMIT 10
  `;

  let context = "";
  for (const doc of matches) {
    context += `File: ${doc.fileName}\nSummary: ${doc.summary}\nCode:\n${doc.sourceCode}\n\n`;
  }

  void (async () => {
    try {
      const { textStream } = streamText({
        model: google(CHAT_MODEL),
        prompt: `You are a code assistant helping a developer understand this codebase.
Answer using ONLY the context below. If the context doesn't contain the answer, say so plainly instead of guessing.
Explain the "why", not just the "what". Reference specific files by name. Keep it focused — a senior engineer explaining to a teammate, not a tutorial.

CONTEXT:
${context || "No relevant files were found in the index for this question."}

QUESTION:
${question}`,
      });
      for await (const delta of textStream) {
        stream.update(delta);
      }
    } catch (error) {
      stream.update(`\n\n_Something went wrong generating the answer: ${error instanceof Error ? error.message : "unknown error"}_`);
    } finally {
      stream.done();
    }
  })();

  return { output: stream.value, filesReferences: matches };
}

// Separate from chat on purpose: ranked file results by meaning, no generation step.
export async function searchCode(projectId: string, query: string) {
  await requireUserId();
  const queryVector = await embedText(query);
  const vectorLiteral = `[${queryVector.join(",")}]`;

  return db.$queryRaw<(FileReference & { similarity: number })[]>`
    SELECT "fileName", "sourceCode", "summary",
      1 - ("embedding" <=> ${vectorLiteral}::vector) AS similarity
    FROM "FileEmbedding"
    WHERE "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 8
  `;
}

export async function saveAnswer(input: {
  projectId: string;
  question: string;
  answer: string;
  filesReferences: FileReference[];
}) {
  const userId = await requireUserId();
  return db.question.create({
    data: {
      projectId: input.projectId,
      userId,
      question: input.question,
      answer: input.answer,
      filesReferences: input.filesReferences.map((f) => ({ fileName: f.fileName, summary: f.summary })),
    },
  });
}

export async function getQuestions(projectId: string) {
  await requireUserId();
  return db.question.findMany({
    where: { projectId },
    include: { user: { select: { name: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteQuestion(questionId: string) {
  const userId = await requireUserId();
  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question || question.userId !== userId) throw new Error("Not found");
  await db.question.delete({ where: { id: questionId } });
}
