import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import "../globals.css";
import { fontVariables } from "../fonts";

// The dashboard renders per request so every response carries a fresh CSP nonce
// (set in src/proxy.ts and applied by Next.js to its own scripts).
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { colorScheme: "light dark" };

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
