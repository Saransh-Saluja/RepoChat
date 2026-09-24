import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  weight: "variable",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "RepoPilot — understand any codebase in minutes",
  description: "Point RepoPilot at a GitHub repo. It reads every file, so you don't have to start from zero.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#E8A33D",
          colorBackground: "#1B1F26",
          colorInputBackground: "#20242C",
          colorInputText: "#E7E9EC",
          colorText: "#E7E9EC",
          colorTextSecondary: "#8B93A1",
          colorNeutral: "#E7E9EC",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "border border-[#2A2F38] shadow-none",
          headerTitle: "font-medium",
          footerActionLink: "text-[#E8A33D] hover:text-[#E8A33D]/80",
        },
      }}
    >
      <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
        <body className="bg-bg text-ink antialiased">
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#1B1F26",
                border: "1px solid #2A2F38",
                color: "#E7E9EC",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
