import { auth } from "@clerk/nextjs/server";
import { Nav } from "~/components/landing/nav";
import { Hero } from "~/components/landing/hero";
import { Features } from "~/components/landing/features";
import { HowItWorks } from "~/components/landing/how-it-works";
import { Footer } from "~/components/landing/footer";

export default async function LandingPage() {
  const { userId } = await auth();
  const signedIn = !!userId;

  return (
    <div className="min-h-screen">
      <Nav signedIn={signedIn} />
      <Hero signedIn={signedIn} />
      <Features />
      <HowItWorks />
      <Footer signedIn={signedIn} />
    </div>
  );
}
