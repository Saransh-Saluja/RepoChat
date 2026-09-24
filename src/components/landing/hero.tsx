import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CodeAnnotationMock } from "./code-annotation-mock";

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
      <div>
        <p className="mb-5 space-y-0.5 font-mono text-[12px] text-diff-add">
          <span className="block">+ index a repo</span>
          <span className="block">+ ask it anything</span>
        </p>
        <h1 className="font-display text-[2.75rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl">
          A codebase that
          <br />
          explains itself.
        </h1>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
          Point RepoPilot at a GitHub repo. It indexes every file, then answers questions,
          searches by meaning, and writes the overview no one had time to write.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={signedIn ? "/dashboard" : "/sign-up"}>
            <Button size="lg">{signedIn ? "Go to dashboard" : "Get started free"}</Button>
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-1.5 px-2 text-sm text-muted hover:text-ink">
            See how it works
            <ArrowRight className="size-3.5" />
          </a>
        </div>
        <p className="mt-8 border-t border-border pt-5 text-xs text-muted/60">
          Works with any public GitHub repository. No credit card required.
        </p>
      </div>

      <CodeAnnotationMock />
    </section>
  );
}
