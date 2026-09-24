import type { Project } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/core";

// Cycled deliberately (not a huge rainbow palette) so it reads as one coherent system.
const SWATCHES = ["#E8A33D", "#5FB489", "#7C9CC4", "#B589D9", "#D9695F", "#8B93A1"];

export function OverviewTab({
  project,
  languageBreakdown,
  indexedFileCount,
}: {
  project: Project;
  languageBreakdown: { extension: string; count: number }[];
  indexedFileCount: number;
}) {
  const total = languageBreakdown.reduce((sum, l) => sum + l.count, 0) || 1;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>What this repo does</CardTitle>
        </CardHeader>
        <CardContent>
          {project.description ? (
            <p className="text-[15px] leading-relaxed text-ink">{project.description}</p>
          ) : (
            <p className="text-sm text-muted">No description was set on GitHub for this repo.</p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <Stat label="Files indexed" value={indexedFileCount.toString()} />
            <Stat label="Primary language" value={project.primaryLanguage ?? "—"} />
            <Stat label="Status" value="Ready" accent />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composition</CardTitle>
        </CardHeader>
        <CardContent>
          {languageBreakdown.length === 0 ? (
            <p className="text-sm text-muted">No files indexed yet.</p>
          ) : (
            <>
              <div className="mb-4 flex h-2 w-full overflow-hidden rounded-full">
                {languageBreakdown.map((l, i) => (
                  <div
                    key={l.extension}
                    style={{ width: `${(l.count / total) * 100}%`, background: SWATCHES[i % SWATCHES.length] }}
                  />
                ))}
              </div>
              <ul className="space-y-2">
                {languageBreakdown.map((l, i) => (
                  <li key={l.extension} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-mono text-muted">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: SWATCHES[i % SWATCHES.length] }}
                      />
                      .{l.extension}
                    </span>
                    <span className="text-muted/70">{Math.round((l.count / total) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted/70">{label}</p>
      <p className={`mt-0.5 truncate font-mono text-sm ${accent ? "text-diff-add" : "text-ink"}`}>{value}</p>
    </div>
  );
}
