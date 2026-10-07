import Link from "next/link";

export function NotFoundBody() {
  return (
    <div className="container-page py-24 md:py-32">
      <p className="label text-ink-3">
        <span className="text-signal-ink">404</span> · No route to host
      </p>
      <h1 className="display mt-6 max-w-4xl">This path doesn&apos;t lead anywhere.</h1>
      <p className="lede mt-6 max-w-xl">
        The page may have moved, or the link was mistyped. The register lists everything that&apos;s been filed.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-[4px] bg-ink px-4 text-paper hover:bg-signal">
          Home
        </Link>
        <Link href="/work" className="inline-flex min-h-11 items-center rounded-[4px] border border-rule-strong px-4 hover:border-ink">
          System register
        </Link>
      </div>
    </div>
  );
}
