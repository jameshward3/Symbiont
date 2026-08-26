import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./auth.css";
import { AuthSessionProvider } from "./auth-session-provider";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const image = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: "Symbiont — Executive Command Center",
    description: "The operating system for an AI-native building intelligence company.",
    openGraph: {
      title: "Symbiont — Executive Command Center",
      description: "The operating system for building intelligence.",
      type: "website",
      images: [{ url: image, width: 1736, height: 907, alt: "Symbiont Executive Command Center" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Symbiont — Executive Command Center",
      description: "The operating system for building intelligence.",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthSessionProvider>{children}</AuthSessionProvider></body></html>;
}
