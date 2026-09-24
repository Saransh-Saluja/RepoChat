import { FileText, SearchCode, MessagesSquare } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Overview, generated",
    body: "The moment indexing finishes, you get a one-page orientation to the repo — no prompt required. Composition, entry points, what it's for.",
  },
  {
    icon: SearchCode,
    title: "Search by meaning",
    body: "Not grep, not a chat reply — a ranked list of the files closest to what you're actually asking, in the same second.",
  },
  {
    icon: MessagesSquare,
    title: "Answers with citations",
    body: "Every answer names the exact files it drew from. Save the good ones — they become a living FAQ for the whole team.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl border-t border-border px-6 py-20">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="sm:px-8 first:sm:pl-0 last:sm:pr-0">
            <Icon className="mb-4 size-5 text-accent" strokeWidth={1.75} />
            <h3 className="mb-2 font-display text-lg font-medium">{title}</h3>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
