"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "~/components/ui/core";
import { searchCode } from "~/server/actions/questions";
import { cn } from "~/lib/utils";

type Result = { fileName: string; sourceCode: string; summary: string; similarity: number };

export function SearchTab({ projectId }: { projectId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchCode(projectId, query);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by meaning — e.g. “where do we validate incoming webhooks”"
          className="pl-9"
        />
      </form>

      {loading && <p className="text-sm text-muted">Searching…</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-muted">No files matched closely enough. Try rephrasing.</p>
      )}

      <div className="space-y-2">
        {results.map((r) => {
          const isOpen = expanded === r.fileName;
          return (
            <div key={r.fileName} className="rounded-lg border border-border bg-surface">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : r.fileName)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[13px] text-ink">{r.fileName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{r.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs text-accent">{Math.round(r.similarity * 100)}%</span>
                  <ChevronDown className={cn("size-4 text-muted transition-transform", isOpen && "rotate-180")} />
                </div>
              </button>
              {isOpen && (
                <pre className="overflow-x-auto border-t border-border bg-surface-2 p-3.5 font-mono text-[12.5px] leading-relaxed text-muted">
                  {r.sourceCode.slice(0, 2000)}
                  {r.sourceCode.length > 2000 ? "\n…" : ""}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
