import { GoogleGenerativeAI } from "@google/generative-ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "./env";
import type { RepoFile } from "./github";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

export const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
export const CHAT_MODEL = "gemini-3.1-flash-lite";
export const EMBEDDING_DIMENSIONS = 768;

// Summarizing before embedding gives much better retrieval than embedding raw
// code: a summary captures *intent*, which is closer to how people phrase questions.
export async function summariseFile(file: RepoFile): Promise<string> {
  const code = file.content.slice(0, 20_000);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await textModel.generateContent([
        `You are a technical onboarding assistant helping a developer understand an unfamiliar codebase.

Explain the purpose of the file \`${file.path}\` based on the code below.

Rules:
- Maximum 100 words
- Focus on: what the file does, why it likely exists, and any key exports worth knowing
- Plain language, minimal jargon

Code:
\`\`\`
${code}
\`\`\``,
      ]);
      return response.response.text();
    } catch (error) {
      console.error(`Summary attempt ${attempt} failed for ${file.path}:`, error);
      if (attempt === 3) return "";
      // Wait for the rate limit to fully reset before retrying
      await new Promise((resolve) => setTimeout(resolve, 60_000));
    }
  }
  return "";
}

export async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    // @ts-expect-error -- outputDimensionality is supported by the API but missing from the current SDK types
    outputDimensionality: EMBEDDING_DIMENSIONS,
  });
  return result.embedding.values;
}
