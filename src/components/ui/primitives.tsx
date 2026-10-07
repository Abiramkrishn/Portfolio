import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "./icons";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** `§02  System files`: the margin marker every section carries. */
export function SectionMark({ n, label, className }: { n: string; label: string; className?: string }) {
  return (
    <p className={cx("label flex items-center gap-3 text-ink-3", className)}>
      <span className="text-signal-ink">§{n}</span>
      <span>{label}</span>
    </p>
  );
}

/**
 * Page section with a margin rail. On large screens the marker sits in a sticky left column,
 * like a technical manual's margin notes; on small screens it sits above the content.
 */
export function Section({
  id,
  n,
  label,
  children,
  aside,
  className,
}: {
  id: string;
  n: string;
  label: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cx("border-t border-rule", className)}>
      <div className="container-page grid gap-y-8 py-16 md:py-24 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <SectionMark n={n} label={label} />
            {aside ? <div className="mt-6 hidden lg:block">{aside}</div> : null}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "signal" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "mono inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] border px-2 py-0.5 text-[0.75rem]",
        tone === "default" && "border-rule bg-card text-ink-2",
        tone === "signal" && "border-signal/40 bg-signal-soft text-signal-ink",
        tone === "muted" && "border-transparent bg-paper-2 text-ink-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  arrow?: boolean;
};

export function ButtonLink({ variant = "primary", arrow = true, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link {...props} className={cx(buttonClass(variant), className)}>
      <span>{children}</span>
      {arrow ? <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" /> : null}
    </Link>
  );
}

export function buttonClass(variant: "primary" | "secondary" | "ghost" = "primary") {
  return cx(
    "group inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[4px] px-4 text-[0.95rem] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-ink text-paper hover:bg-signal hover:text-white",
    variant === "secondary" && "border border-rule-strong text-ink hover:border-ink",
    variant === "ghost" && "px-0 text-ink hover:text-signal-ink",
  );
}

export function Stage({ stage }: { stage: string | null }) {
  if (!stage) return null;
  const labels: Record<string, string> = {
    upcoming: "Upcoming",
    in_progress: "In progress",
    ongoing: "Ongoing",
    shipped: "Shipped",
  };
  const live = stage === "in_progress" || stage === "ongoing";
  return (
    <span className="label inline-flex items-center gap-1.5 text-ink-3">
      <span
        aria-hidden="true"
        className={cx(
          "inline-block size-1.5 rounded-full",
          live ? "bg-signal" : stage === "shipped" ? "bg-ok" : "border border-ink-3",
        )}
      />
      {labels[stage] ?? stage}
    </span>
  );
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
