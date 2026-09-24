"use client";

import { useState } from "react";
import { readStreamableValue } from "@ai-sdk/rsc";
import { Search, FileCode2, Sparkles, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/core";
import { Markdown } from "~/components/ui/markdown";
import { askQuestion, saveAnswer, type FileReference } from "~/server/actions/questions";

type Stage = "idle" | "searching" | "found" | "answering" | "done";

const SUGGESTIONS = [
  "What does this codebase actually do?",
  "Where should I start reading?",
  "How is authentication handled?",
];

export function AskAiTab({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [answer, setAnswer] = useState("");
  const [filesReferences, setFilesReferences] = useState<FileReference[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loading = stage !== "idle" && stage !== "done";

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setQuestion(q);
    setAnswer("");
    setFilesReferences([]);
    setSaved(false);
    setStage("searching");

    const { output, filesReferences: refs } = await askQuestion(projectId, q);
    setFilesReferences(refs);
    setStage("found");

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setStage("answering");
        setAnswer((prev) => prev + delta);
      }
    }
    setStage("done");
  }

  async function onSave() {
    setSaving(true);
    try {
      await saveAnswer({ projectId, question, answer, filesReferences });
      setSaved(true);
      toast.success("Saved to history");
    } catch {
      toast.error("Couldn't save this answer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Which file should I edit to change the pricing logic?"
          className="min-h-20"
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                disabled={loading}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={loading || !question.trim()} size="sm">
            {loading ? "Thinking…" : "Ask"}
          </Button>
        </div>
      </form>

      {stage !== "idle" && (
        <div className="rounded-lg border border-border bg-surface">
          <div className="space-y-4 px-5 py-4">
            {stage === "searching" && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Search className="size-4 animate-pulse text-accent" />
                Searching the codebase for relevant files…
              </div>
            )}

            {(stage === "found" || stage === "answering" || stage === "done") && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <FileCode2 className="size-3.5" />
                  {filesReferences.length > 0
                    ? `Found ${filesReferences.length} relevant file${filesReferences.length === 1 ? "" : "s"}`
                    : "No closely matching files — answering from general context"}
                </div>
                {filesReferences.length > 0 && (
                  <div className="mb-1 flex flex-wrap gap-1.5">
                    {filesReferences.map((f) => (
                      <span
                        key={f.fileName}
                        className="max-w-[220px] truncate rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted"
                        title={f.fileName}
                      >
                        {f.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {stage === "answering" && answer.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Sparkles className="size-4 animate-pulse text-accent" />
                Generating answer…
              </div>
            )}

            {answer.length > 0 && (
              <div className="border-t border-border pt-4">
                <Markdown>{answer}</Markdown>
              </div>
            )}
          </div>

          {stage === "done" && answer.length > 0 && (
            <div className="flex justify-end border-t border-border px-5 py-3">
              <Button variant="outline" size="sm" onClick={onSave} disabled={saving || saved}>
                <BookmarkPlus className="size-3.5" />
                {saved ? "Saved" : saving ? "Saving…" : "Save to history"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
