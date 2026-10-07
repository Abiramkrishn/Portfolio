import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { NotFoundBody } from "@/components/site/not-found-body";
import { themeScript } from "@/components/site/theme-script";

export const metadata: Metadata = {
  title: "Not found | Abiram Krishn",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <main>
          <NotFoundBody />
        </main>
      </body>
    </html>
  );
}
