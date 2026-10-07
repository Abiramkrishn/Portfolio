import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass, cx } from "@/components/ui/primitives";

export function PageHeader({
  title,
  kicker,
  actions,
  children,
}: {
  title: string;
  kicker?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-rule px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker ? <p className="label text-ink-3">{kicker}</p> : null}
          <h1 className="mt-1 text-[1.6rem] font-semibold tracking-[-0.02em]">{title}</h1>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

export function Panel({ title, description, children, id }: { title: string; description?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-[6px] border border-rule bg-card/60">
      <div className="border-b border-rule px-5 py-3.5">
        <h2 className="font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 text-[0.88rem] text-ink-3">{description}</p> : null}
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

export function SmallLink({ href, children, variant = "secondary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Link href={href} className={cx(buttonClass(variant), "min-h-9 px-3 text-[0.88rem]")}>
      {children}
    </Link>
  );
}

export const inputClass =
  "w-full rounded-[4px] border border-rule-strong bg-paper px-3 py-2 text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none aria-[invalid=true]:border-signal";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label mb-1.5 block text-ink-3">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-[0.8rem] text-ink-3">{hint}</p> : null}
      {error ? <p className="mt-1 text-[0.8rem] text-signal-ink">{error}</p> : null}
    </div>
  );
}

export function ReviewBanner({ what }: { what: string }) {
  return (
    <div role="note" className="border-b border-signal/40 bg-signal-soft px-4 py-3 text-[0.9rem] md:px-8">
      <strong className="font-semibold">Seeded draft: verify before relying on it.</strong> This {what} was drafted
      from your brief and repositories; some details are inferred. Check every section, fill in what&apos;s missing, then untick
      &ldquo;Needs review&rdquo; under Publishing.
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "signal" | "ok" | "muted" | "ink"; children: ReactNode }) {
  return (
    <span
      className={cx(
        "mono inline-flex items-center rounded-[3px] px-1.5 py-0.5 text-[0.7rem] uppercase tracking-[0.06em]",
        tone === "signal" && "bg-signal-soft text-signal-ink",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "muted" && "bg-paper-2 text-ink-3",
        tone === "ink" && "bg-ink text-paper",
      )}
    >
      {children}
    </span>
  );
}
