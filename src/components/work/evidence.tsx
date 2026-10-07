import Image from "next/image";
import type { Evidence } from "@/lib/types";
import type { MediaMeta } from "@/db/queries/public";
import { ArrowUpRight } from "@/components/ui/icons";

export function EvidenceGallery({ items, media }: { items: Evidence[]; media: Record<string, MediaMeta> }) {
  const images = items.filter((e): e is Extract<Evidence, { kind: "image" }> => e.kind === "image" && Boolean(media[e.mediaId]));
  const links = items.filter((e): e is Extract<Evidence, { kind: "link" }> => e.kind === "link");

  return (
    <div className="space-y-10">
      {images.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {images.map((img, i) => {
            const m = media[img.mediaId];
            return (
              <figure key={img.mediaId + i} className={images.length === 1 ? "md:col-span-2" : undefined}>
                <div className="reg-marks overflow-hidden border border-rule bg-card">
                  <Image
                    src={`/media/${m.id}`}
                    alt={m.alt}
                    width={m.width}
                    height={m.height}
                    sizes="(min-width: 1280px) 900px, (min-width: 768px) 70vw, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                {img.caption ? (
                  <figcaption className="mt-2 text-[0.88rem] text-ink-3">
                    <span className="label text-signal-ink">E{String(i + 1).padStart(2, "0")}</span> {img.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      ) : null}

      {links.length > 0 ? (
        <ul className="border-t border-rule">
          {links.map((l, i) => (
            <li key={l.url + i} className="border-b border-rule">
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 py-4"
              >
                <span>
                  <span className="block text-ink group-hover:text-signal-ink">{l.caption || l.url}</span>
                  <span className="mono mt-0.5 block text-[0.78rem] text-ink-3">
                    {l.url.replace(/^https?:\/\//, "")}
                  </span>
                </span>
                <ArrowUpRight className="shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
