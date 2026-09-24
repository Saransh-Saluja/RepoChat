const FILES = [
  { name: "api", type: "dir" },
  { name: "auth", type: "dir", open: true },
  { name: "verifyToken.ts", type: "file", indent: true, active: true },
  { name: "middleware.ts", type: "file", indent: true },
  { name: "components", type: "dir" },
  { name: "lib", type: "dir" },
];

export function CodeAnnotationMock() {
  return (
    <div className="animate-reveal overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/30" style={{ animationDelay: "150ms", opacity: 0 }}>
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="ml-2 font-mono text-[11px] text-muted/70">repopilot — src/auth</span>
      </div>

      <div className="flex">
        {/* file tree */}
        <div className="w-40 shrink-0 border-r border-border px-2 py-3">
          {FILES.map((f) => (
            <div
              key={f.name}
              className={`truncate rounded px-2 py-1 font-mono text-[11.5px] ${
                f.active ? "bg-accent/10 text-accent" : "text-muted"
              } ${f.indent ? "pl-4" : ""}`}
            >
              {f.type === "dir" ? "▾ " : ""}
              {f.name}
            </div>
          ))}
        </div>

        {/* code + annotation */}
        <div className="flex-1 px-5 py-4">
          <pre className="font-mono text-[12.5px] leading-relaxed">
            <span className="text-muted/50">1</span>{"  "}
            <span className="text-[#7C9CC4]">export function</span> <span className="text-ink">verifyToken</span>
            <span className="text-muted">(token: string) {"{"}</span>
            {"\n"}
            <span className="text-muted/50">2</span>{"  "}
            <span className="rounded bg-accent/10 px-0.5 text-ink">
              const decoded = jwt.verify(token, SECRET)
            </span>
            {"\n"}
            <span className="text-muted/50">3</span>{"  "}
            <span className="text-[#7C9CC4]">if</span> <span className="text-ink">(!decoded.sub)</span>{" "}
            <span className="text-[#7C9CC4]">throw new</span> <span className="text-ink">AuthError()</span>
            {"\n"}
            <span className="text-muted/50">4</span>{"  "}
            <span className="text-[#7C9CC4]">return</span> <span className="text-ink">decoded</span>
            {"\n"}
            <span className="text-muted/50">5</span>{"  "}
            <span className="text-muted">{"}"}</span>
          </pre>

          <div
            className="animate-reveal mt-4 rounded-md border-l-2 border-accent bg-accent/[0.06] px-3.5 py-3"
            style={{ animationDelay: "550ms", opacity: 0 }}
          >
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-accent">RepoPilot</p>
            <p className="text-[13px] leading-relaxed text-ink/90">
              Validates the JWT and rejects tokens with no subject claim. Called from every protected route
              via <span className="font-mono text-accent">middleware.ts</span> — the one file to check before
              changing auth behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
