import Image from "next/image";
import type { ReactNode } from "react";
import portrait from "@/assets/abiram-krishn.jpg";
import { site } from "@/content/site";
import { cx } from "@/components/ui/primitives";

export { portrait };

const ALT = `${site.name}, wearing glasses and a dark denim shirt, standing in front of a carved wooden door.`;

/**
 * Profile card: the photo inset on a soft card, name and role beneath it, and any facts passed
 * as children in hairline rows. With `compactUntil="lg"` it becomes a horizontal contact card
 * on small screens (one image element either way).
 *
 * Replace src/assets/abiram-krishn.jpg to change the photo (strip location metadata first).
 */
export function ProfileCard({
  sizes,
  preload = false,
  compactUntil,
  className,
  children,
}: {
  sizes: string;
  preload?: boolean;
  compactUntil?: "lg";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx("rounded-[14px] border border-rule bg-card p-2 shadow-[var(--shadow)]", className)}>
      <div className={cx(compactUntil && "grid grid-cols-[4.75rem_1fr] items-center gap-4 lg:block")}>
        <div className="overflow-hidden rounded-[9px] bg-paper-2">
          <Image
            src={portrait}
            alt={ALT}
            sizes={sizes}
            preload={preload}
            placeholder="blur"
            className="block aspect-square h-auto w-full object-cover"
          />
        </div>
        <div className={cx(compactUntil ? "lg:px-2 lg:pt-4 lg:pb-3" : "px-2 pt-4 pb-3")}>
          <p className="text-[1.05rem] font-semibold tracking-[-0.01em] text-ink">{site.name}</p>
          <p className="mt-0.5 text-[0.88rem] text-ink-3">{site.role}</p>
        </div>
      </div>
      {children ? <div className="mx-2 mt-2 border-t border-rule lg:mt-0">{children}</div> : null}
    </div>
  );
}

/** A fact row inside the profile card. */
export function ProfileRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[4.75rem_1fr] gap-3 py-2.5">
      <dt className="label pt-0.5 text-ink-3">{label}</dt>
      <dd className="min-w-0 break-words text-[0.9rem] leading-snug text-ink-2">{children}</dd>
    </div>
  );
}
