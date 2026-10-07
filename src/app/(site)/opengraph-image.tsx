import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Abiram Krishn. I build complete systems. Then I try to break them.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: "Independent engineer · AI · SaaS · Integrations · Security",
    title: "I build complete systems. Then I try to break them.",
    lines: [
      [{ text: "I build complete systems." }],
      [{ text: "Then I try to" }, { text: "break", signal: true }, { text: "them." }],
    ],
  });
}
