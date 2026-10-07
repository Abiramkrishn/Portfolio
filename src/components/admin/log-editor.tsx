"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { saveLog } from "@/app/admin/(protected)/lab/actions";
import type { SaveState } from "@/app/admin/(protected)/projects/actions";
import type { LogInput } from "@/lib/validation";
import { LINK_KINDS, LOG_KINDS, type ProjectLink } from "@/lib/types";
import { ALL_TOOL_NAMES } from "@/content/taxonomy";
import { KIND_LABEL } from "@/components/lab/log-list";
import { buttonClass, cx } from "@/components/ui/primitives";
import { Checkbox, MarkdownField, Repeater, TagInput, TextArea, TextField } from "./fields";
import { Panel, inputClass } from "./ui";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export function LogEditor({
  id,
  initial,
  projects,
}: {
  id: string | null;
  initial: LogInput;
  projects: { id: string; code: string; title: string }[];
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveLog, { status: "idle" });
  const [e, setE] = useState<LogInput>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const payload = useMemo(() => JSON.stringify(e), [e]);
  const dirty = payload !== baseline;
  const set = (patch: Partial<LogInput>) => setE((cur) => ({ ...cur, ...patch }));
  const err = state.errors ?? {};

  const [lastSaved, setLastSaved] = useState(state.savedAt);
  if (state.status === "ok" && state.savedAt !== lastSaved) {
    setLastSaved(state.savedAt);
    setBaseline(payload);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (ev: BeforeUnloadEvent) => ev.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form action={action} className="px-4 pt-6 pb-28 md:px-8">
      <input type="hidden" name="id" value={id ?? ""} />
      <input type="hidden" name="payload" value={payload} />
      <div className="max-w-4xl space-y-6">
        {state.status === "error" ? (
          <div role="alert" className="border-l-2 border-signal bg-signal-soft px-4 py-3 text-[0.92rem]">
            <p className="font-medium">{state.message}</p>
            <ul className="mono mt-2 space-y-0.5 text-[0.8rem]">
              {Object.entries(err).map(([k, v]) => (
                <li key={k}>
                  {k}: {v}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Panel title="Entry">
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <TextField label="Title" value={e.title} error={err.title} onChange={(title) => set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) })} />
            <TextField label="Code" value={e.code} onChange={(code) => set({ code })} mono />
          </div>
          <TextField
            label="Slug"
            value={e.slug}
            error={err.slug}
            hint={`/lab/${e.slug || "…"}`}
            onChange={(slug) => {
              setSlugTouched(true);
              set({ slug: slugify(slug) });
            }}
            mono
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="label block text-ink-3">
              Kind
              <select value={e.kind} onChange={(ev) => set({ kind: ev.target.value as LogInput["kind"] })} className={`${inputClass} mt-1.5 normal-case tracking-normal`}>
                {LOG_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            <TextField label="Date" type="date" value={e.publishedAt} onChange={(publishedAt) => set({ publishedAt })} hint="Defaults to today when published." />
            <label className="label block text-ink-3">
              Related project
              <select
                value={e.projectId ?? ""}
                onChange={(ev) => set({ projectId: ev.target.value || null })}
                className={`${inputClass} mt-1.5 normal-case tracking-normal`}
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <TextArea label="Summary" value={e.summary} onChange={(summary) => set({ summary })} rows={2} hint="One or two sentences for the list and search results." />
          <MarkdownField label="Body" value={e.body} onChange={(body) => set({ body })} rows={18} error={err.body} />
          <TagInput label="Tags" value={e.tags} onChange={(tags) => set({ tags })} suggestions={ALL_TOOL_NAMES} hint="Tools that match the stack map link this entry as evidence." />
        </Panel>

        <Panel title="Links">
          <Repeater<ProjectLink>
            items={e.links}
            onChange={(links) => set({ links })}
            make={() => ({ label: "", url: "", kind: "repo" })}
            addLabel="Add link"
            itemLabel={(l) => l.label || l.kind}
            render={(l, update) => (
              <div className="grid gap-3 sm:grid-cols-[7rem_1fr_2fr]">
                <label className="label block text-ink-3">
                  Kind
                  <select value={l.kind} onChange={(ev) => update({ kind: ev.target.value as ProjectLink["kind"] })} className={`${inputClass} mt-1.5 normal-case tracking-normal`}>
                    {LINK_KINDS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
                <TextField label="Label" value={l.label} onChange={(label) => update({ label })} />
                <TextField label="URL" value={l.url} onChange={(url) => update({ url })} placeholder="https://" />
              </div>
            )}
          />
        </Panel>

        <Panel title="Publishing">
          <fieldset>
            <legend className="label mb-2 text-ink-3">Visibility</legend>
            <div className="flex gap-2">
              {(["draft", "published"] as const).map((v) => (
                <label
                  key={v}
                  className={cx(
                    "mono cursor-pointer rounded-[4px] border px-3 py-1.5 text-[0.8rem] capitalize has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                    e.visibility === v ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-2",
                  )}
                >
                  <input type="radio" className="sr-only" checked={e.visibility === v} onChange={() => set({ visibility: v })} />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
          <Checkbox label="Needs review" checked={e.needsReview} onChange={(needsReview) => set({ needsReview })} />
        </Panel>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/95 backdrop-blur lg:left-60">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <p aria-live="polite" className="text-[0.88rem] text-ink-3">
            {pending ? "Saving…" : state.status === "ok" && !dirty ? state.message : dirty ? "Unsaved changes" : id ? "All changes saved" : "New entry, not saved yet"}
          </p>
          <div className="flex items-center gap-2">
            {id ? (
              <Link href={`/admin/preview?lab=${id}`} target="_blank" className={cx(buttonClass("secondary"), "min-h-10 px-3 text-[0.88rem]")}>
                Preview
              </Link>
            ) : null}
            <button type="submit" disabled={pending} className={cx(buttonClass("primary"), "min-h-10 px-4 text-[0.88rem]")}>
              {pending ? "Saving…" : id ? "Save" : "Create entry"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
