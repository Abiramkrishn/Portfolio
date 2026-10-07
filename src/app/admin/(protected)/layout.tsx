import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminCounts } from "@/db/queries/admin";
import { logout } from "../auth-actions";
import { AdminNav } from "@/components/admin/nav";
import { ArrowUpRight } from "@/components/ui/icons";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const counts = await adminCounts();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-rule bg-paper-2/60 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-6 p-4 lg:p-5">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 rounded-full bg-signal" />
              <span className="font-semibold">Dashboard</span>
            </Link>
            <Link href="/" target="_blank" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink lg:hidden">
              Site <ArrowUpRight size={11} />
            </Link>
          </div>
          <AdminNav newInquiries={counts.inquiries.fresh} />
          <div className="mt-auto hidden space-y-2 lg:block">
            <Link href="/" target="_blank" className="label flex items-center gap-1 text-ink-3 hover:text-ink">
              View site <ArrowUpRight size={11} />
            </Link>
            <form action={logout}>
              <button type="submit" className="label text-ink-3 hover:text-signal-ink">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
