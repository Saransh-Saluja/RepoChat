import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>RepoPilot</h1>
      <p>An AI-powered assistant for understanding GitHub repositories.</p>

      <SignedOut>
        <div className="actions">
          <SignInButton mode="modal">
            <button>Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button>Get started</button>
          </SignUpButton>
        </div>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard">Go to dashboard →</Link>
      </SignedIn>
    </main>
  );
}
