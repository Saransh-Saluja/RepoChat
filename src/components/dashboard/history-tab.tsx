"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Trash2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "~/components/ui/markdown";
import { getQuestions, deleteQuestion } from "~/server/actions/questions";
import { cn } from "~/lib/utils";

type QuestionWithUser = Awaited<ReturnType<typeof getQuestions>>[number];

export function HistoryTab({ projectId }: { projectId: string }) {
  const [questions, setQuestions] = useState<QuestionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void getQuestions(projectId)
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [projectId]);

  async function onDelete(id: string) {
    const prev = questions;
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    try {
      await deleteQuestion(id);
    } catch {
      setQuestions(prev);
      toast.error("Couldn't delete that entry");
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading history…</p>;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-14 text-center">
        <MessageSquareText className="size-5 text-muted/60" />
        <p className="text-sm text-muted">Nothing saved yet — answers you save from Ask AI show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((q) => {
        const isOpen = openId === q.id;
        return (
          <div key={q.id} className="rounded-lg border border-border bg-surface">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : q.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] text-ink">{q.question}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {q.user.name ?? "Someone"} · {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-4">
                <Markdown>{q.answer}</Markdown>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(q.filesReferences) &&
                      (q.filesReferences as { fileName: string }[]).map((f) => (
                        <span
                          key={f.fileName}
                          className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted"
                        >
                          {f.fileName}
                        </span>
                      ))}
                  </div>
                  <button
                    onClick={() => void onDelete(q.id)}
                    className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-diff-del"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
