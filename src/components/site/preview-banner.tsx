import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

async function exitPreview() {
  "use server";
  (await draftMode()).disable();
  redirect("/admin");
}

/** Shown only to the owner while previewing drafts from the dashboard. */
export async function PreviewBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <aside role="status" className="bg-signal text-white">
      <div className="container-page flex min-h-10 items-center justify-between gap-4 text-[0.85rem]">
        <span className="mono">Preview mode: drafts are visible. Visitors don&apos;t see this.</span>
        <form action={exitPreview}>
          <button type="submit" className="mono underline underline-offset-2">
            Exit preview
          </button>
        </form>
      </div>
    </aside>
  );
}
