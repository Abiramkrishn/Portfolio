import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

// IBM Plex: a type family drawn for technical documentation. The variable sans covers
// body text and, via its width axis, the condensed display headlines. Self-hosted at build
// time, so there's no request to Google from the visitor's browser.
export const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  axes: ["wdth"],
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = `${sans.variable} ${mono.variable}`;
