import { listMedia, mediaUsage } from "@/db/queries/admin";
import { PageHeader, inputClass } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { UploadForm } from "@/components/admin/upload-form";
import { deleteMedia, updateAlt } from "./actions";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Media" };

export default async function MediaAdmin() {
  const items = await listMedia();
  const usage = await Promise.all(items.map((m) => mediaUsage(m.id)));

  return (
    <>
      <PageHeader kicker="Library" title="Media">
        <p className="mt-3 max-w-2xl text-[0.9rem] text-ink-3">
          Screenshots and diagrams for project evidence. Every upload is decoded and re-encoded on the server: EXIF and
          GPS data are stripped, SVG is refused, and images are capped at 2400px.
        </p>
      </PageHeader>
      <div className="space-y-8 px-4 py-6 md:px-8">
        <UploadForm />
        {items.length === 0 ? (
          <p className="text-ink-3">No images yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((m, i) => (
              <li key={m.id} className="overflow-hidden rounded-[6px] border border-rule bg-card/60">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an already-optimised image */}
                <img src={`/media/${m.id}`} alt={m.alt} className="aspect-video w-full bg-paper-2 object-contain" />
                <div className="space-y-3 p-3">
                  <p className="mono truncate text-[0.75rem] text-ink-3" title={m.filename}>
                    {m.width}×{m.height} · {(m.size / 1024).toFixed(0)} KB · {m.filename}
                  </p>
                  <form action={updateAlt} className="flex gap-2">
                    <input type="hidden" name="id" value={m.id} />
                    <input name="alt" defaultValue={m.alt} aria-label="Alt text" className={inputClass} maxLength={300} required />
                    <button type="submit" className="mono shrink-0 rounded-[4px] border border-rule-strong px-2.5 text-[0.75rem] hover:border-ink">
                      Save
                    </button>
                  </form>
                  {usage[i].length > 0 ? (
                    <p className="label text-ink-3">Used in {usage[i].map((u) => u.code).join(", ")}</p>
                  ) : (
                    <form action={deleteMedia}>
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton message="Delete this image? This can't be undone.">Delete</ConfirmButton>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
