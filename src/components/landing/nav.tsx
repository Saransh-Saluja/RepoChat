import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "~/components/ui/button";

export function Nav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2">
        <Compass className="size-[18px] text-accent" strokeWidth={2.25} />
        <span className="font-display text-[16px] font-medium tracking-tight">RepoPilot</span>
      </Link>
      <nav className="flex items-center gap-5">
        <Link href={signedIn ? "/dashboard" : "/sign-in"} className="text-sm text-muted transition-colors hover:text-ink">
          {signedIn ? "Dashboard" : "Sign in"}
        </Link>
        <Link href={signedIn ? "/dashboard" : "/sign-up"}>
          <Button size="sm">Get started</Button>
        </Link>
      </nav>
    </header>
  );
}
