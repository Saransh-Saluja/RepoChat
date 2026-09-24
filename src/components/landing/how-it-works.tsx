const STEPS = [
  { n: "01", title: "Paste a URL", body: "Any public GitHub repo. Private repos work too, with a token." },
  { n: "02", title: "It reads every file", body: "Each file is summarized and embedded — you watch it happen in real time." },
  { n: "03", title: "Ask, search, or skim", body: "Chat with citations, search by meaning, or just read the auto-generated overview." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl border-t border-border px-6 py-20">
      <h2 className="mb-12 font-display text-2xl font-medium">How it works</h2>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n}>
            <p className="mb-3 font-mono text-sm text-accent">{step.n}</p>
            <h3 className="mb-2 text-[17px] font-medium">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
