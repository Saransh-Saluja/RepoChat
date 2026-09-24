import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "~/components/ui/button";

export function Footer({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <section className="mx-auto max-w-6xl border-t border-border px-6 py-20 text-center">
        <h2 className="mx-auto max-w-lg font-display text-3xl font-medium leading-tight">
          Stop re-explaining the codebase.
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          Index your first repo in under a minute.
        </p>
        <Link href={signedIn ? "/dashboard" : "/sign-up"} className="mt-7 inline-block">
          <Button size="lg">{signedIn ? "Go to dashboard" : "Get started free"}</Button>
        </Link>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-muted" strokeWidth={2} />
            <span className="font-display text-sm text-muted">RepoPilot</span>
          </div>
          <p className="text-xs text-muted/60">Built for developers who inherit codebases.</p>
        </div>
      </footer>
    </>
  );
}
