import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-3 text-[15px] leading-relaxed text-ink last:mb-0">{children}</p>,
        h1: ({ children }) => <h3 className="mb-2 mt-4 font-display text-lg font-medium first:mt-0">{children}</h3>,
        h2: ({ children }) => <h3 className="mb-2 mt-4 font-display text-base font-medium first:mt-0">{children}</h3>,
        h3: ({ children }) => <h4 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h4>,
        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 text-[15px] text-ink">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-[15px] text-ink">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2">
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const isBlock = /language-/.test(className ?? "");
          if (!isBlock) {
            return (
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-accent">{children}</code>
            );
          }
          return <code className="font-mono text-[13px] leading-relaxed">{children}</code>;
        },
        pre: ({ children }) => (
          <pre className="mb-3 overflow-x-auto rounded-md border border-border bg-surface-2 p-3.5">{children}</pre>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
