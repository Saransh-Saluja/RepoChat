import { Octokit } from "octokit";

export type RepoFile = {
  path: string;
  content: string;
  extension: string;
};

// Extensions worth summarizing/embedding. Deliberately code-focused —
// markdown/config are useful context but bloat the index fast.
const CODE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "rb", "go", "rs", "java", "kt", "swift", "c", "cpp", "h", "hpp", "cs",
  "php", "scala", "vue", "svelte",
  "css", "scss",
  "sql", "graphql", "prisma",
  "md", "mdx",
]);

const IGNORE_SEGMENTS = [
  "node_modules", "dist", "build", ".next", ".turbo", "vendor",
  "coverage", ".git", "public", "assets", "images", "fonts",
  "__generated__", "generated",
];

const IGNORE_FILE_SUFFIXES = [
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
  ".min.js", ".min.css", ".map", ".svg", ".lock",
];

const MAX_FILE_BYTES = 100_000; // skip generated/bundled files that are mostly noise
const MAX_FILES = 200; // keeps indexing time and Gemini free-tier usage bounded

export function parseGithubUrl(githubUrl: string): { owner: string; repo: string } {
  const cleaned = githubUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const match = /github\.com[/:]([^/]+)\/([^/]+)/.exec(cleaned);
  if (!match?.[1] || !match[2]) {
    throw new Error("That doesn't look like a GitHub repository URL (expected github.com/owner/repo)");
  }
  return { owner: match[1], repo: match[2] };
}

function isIndexableFile(path: string): boolean {
  const lower = path.toLowerCase();
  if (IGNORE_SEGMENTS.some((seg) => lower.includes(`/${seg}/`) || lower.startsWith(`${seg}/`))) return false;
  if (IGNORE_FILE_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return false;
  const ext = lower.split(".").pop() ?? "";
  return CODE_EXTENSIONS.has(ext);
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R | null>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      if (current === undefined) continue;
      try {
        const result = await fn(current);
        if (result !== null) results.push(result);
      } catch {
        // one bad file shouldn't stop the whole batch
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function getRepoMeta(githubUrl: string, token?: string) {
  const octokit = new Octokit({ auth: token ?? process.env.GITHUB_TOKEN });
  const { owner, repo } = parseGithubUrl(githubUrl);
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return {
    description: data.description ?? null,
    primaryLanguage: data.language ?? null,
    defaultBranch: data.default_branch,
    stars: data.stargazers_count,
  };
}

// Lists every file in the repo's default branch in one call, filters to
// indexable source files, then fetches blob content a handful at a time.
export async function fetchRepoFiles(githubUrl: string, token?: string): Promise<RepoFile[]> {
  const octokit = new Octokit({ auth: token ?? process.env.GITHUB_TOKEN });
  const { owner, repo } = parseGithubUrl(githubUrl);

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const branch = repoData.default_branch;

  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  const candidates = (tree.tree ?? [])
    .filter(
      (item) =>
        item.type === "blob" &&
        !!item.path &&
        !!item.sha &&
        (item.size === undefined || item.size < MAX_FILE_BYTES) &&
        isIndexableFile(item.path),
    )
    .slice(0, MAX_FILES);

  return mapWithConcurrency(candidates, 5, async (item) => {
    if (!item.sha || !item.path) return null;
    const { data: blob } = await octokit.rest.git.getBlob({ owner, repo, file_sha: item.sha });
    const content = Buffer.from(blob.content, blob.encoding as BufferEncoding).toString("utf-8");
    if (!content.trim()) return null;
    return { path: item.path, content, extension: item.path.split(".").pop() ?? "" };
  });
}
