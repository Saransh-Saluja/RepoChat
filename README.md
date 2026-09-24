# RepoPilot

Point it at a GitHub repo. It reads every file, embeds them, and lets you ask questions,
search by meaning, or just read the auto-generated overview — with real-time indexing
progress instead of a fake spinner.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Clerk (auth) · Postgres + pgvector
via Prisma · Google Gemini (`gemini-embedding-2` + `gemini-3.1-flash-lite`) via the
Vercel AI SDK · Octokit (no LangChain) · Plain Next.js Server Actions (no tRPC).

Kept deliberately lean — see `ARCHITECTURE.md`-style notes below for why each piece
was chosen, so it's easy to explain in an interview.

## Setup

```bash
npm install
cp .env.example .env   # fill in the values below
npx prisma db push     # creates tables (needs the pgvector extension enabled once — see below)
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | A Postgres connection string. Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) — both support `pgvector` free. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) → your app → API Keys |
| `CLERK_SECRET_KEY` | same page |
| `GEMINI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `GITHUB_TOKEN` | *(optional)* [github.com/settings/tokens](https://github.com/settings/tokens) → classic token, `repo` scope. Raises the GitHub API rate limit from 60/hr to 5000/hr and lets you index private repos. |

Before your first `prisma db push`, enable the vector extension once in your DB's SQL console:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## How indexing actually works

1. `fetchRepoFiles` (`src/lib/github.ts`) lists the whole repo tree in one Octokit call,
   filters to indexable source files (skips lockfiles, `node_modules`, binaries, generated
   code), then pulls file contents a few at a time.
2. Each file is summarized by Gemini (`summariseFile`) — embedding the summary instead of
   raw code retrieves much better, since questions are phrased in plain language.
3. The summary is embedded (`embedText`, 768 dimensions) and stored in Postgres via
   pgvector, one file at a time — `indexProject` writes progress to the DB after every
   single file, which is what lets the UI show real numbers instead of a spinner.
4. Asking a question embeds it the same way, does a cosine-similarity search
   (`<=>` operator) for the closest files, then streams an answer grounded in that
   context via the Vercel AI SDK.

## Easy extension points

The schema and actions were kept intentionally small so these are additions, not rewrites:

- **Team sharing** — add a `ProjectMember` join table (mirrors `User <-> Project`), same
  pattern as `Question.userId`. No changes needed elsewhere.
- **Re-indexing on push** — `FileEmbedding` already has a `@@unique([projectId, fileName])`
  constraint; swap `create` for `upsert` in `indexProject` and call it from a GitHub webhook.
- **PR/issue-aware answers** — `fetchRepoFiles` returns a flat list; add a sibling
  `fetchOpenPRs` in `github.ts` and merge results before embedding.
- **Hotspot detection** — cross-reference commit frequency (Octokit `repos.listCommits`)
  against `FileEmbedding` rows to flag frequently-changed, under-documented files.

## Project structure

```
src/
  app/
    page.tsx                  marketing landing page
    (app)/                    protected routes (auth + user-sync guard in layout.tsx)
      dashboard/page.tsx       empty state
      dashboard/[projectId]/   project workspace
    sign-in/ sign-up/ sync-user/
  components/
    ui/                       design-system primitives
    landing/                  marketing page sections
    dashboard/                app screens
  lib/                        db, env, github, ai (Gemini)
  server/actions/             all server actions (projects.ts, questions.ts)
prisma/schema.prisma
```
