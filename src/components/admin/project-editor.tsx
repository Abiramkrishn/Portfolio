"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { saveProject, type SaveState } from "@/app/admin/(protected)/projects/actions";
import type { ProjectInput } from "@/lib/validation";
import { LIFECYCLE, LINK_KINDS, PROJECT_STAGES, type Challenge, type Decision, type Evidence, type ProjectLink } from "@/lib/types";
import { lifecycle } from "@/content/site";
import { ALL_TOOL_NAMES, DOMAINS, DOMAIN_KEYS } from "@/content/taxonomy";
import { buttonClass, cx } from "@/components/ui/primitives";
import { Checkbox, MarkdownField, Repeater, TagInput, TextArea, TextField } from "./fields";
import { DiagramEditor } from "./diagram-editor";
import { Panel, inputClass } from "./ui";

export type MediaOption = { id: string; alt: string; filename: string };

const STAGE_LABEL: Record<string, string> = {
  upcoming: "Upcoming (shows in “In the workshop”)",
  in_progress: "In progress",
  ongoing: "Ongoing",
  shipped: "Shipped",
};

const SECTIONS = [
  ["basics", "Basics"],
  ["coverage", "Lifecycle coverage"],
  ["story", "Problem & build"],
  ["system", "System diagram"],
  ["decisions", "Decisions"],
  ["field-notes", "Field notes"],
  ["security", "Break test & testing"],
  ["evidence", "Evidence & links"],
  ["publishing", "Publishing"],
] as const;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export function ProjectEditor({
  id,
  initial,
  media,
}: {
  id: string | null;
  initial: ProjectInput;
  media: MediaOption[];
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveProject, { status: "idle" });
  const [p, setP] = useState<ProjectInput>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const payload = useMemo(() => JSON.stringify(p), [p]);
  const dirty = payload !== baseline;
  const set = (patch: Partial<ProjectInput>) => setP((cur) => ({ ...cur, ...patch }));
  const err = state.errors ?? {};

  // Once a save succeeds, the saved state becomes the new baseline.
  const [lastSaved, setLastSaved] = useState(state.savedAt);
  if (state.status === "ok" && state.savedAt !== lastSaved) {
    setLastSaved(state.savedAt);
    setBaseline(payload);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form action={action} className="px-4 pt-6 pb-28 md:px-8">
      <input type="hidden" name="id" value={id ?? ""} />
      <input type="hidden" name="payload" value={payload} />

      <div className="xl:grid xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-8">
        <nav aria-label="Editor sections" className="hidden xl:block">
          <ol className="sticky top-6 space-y-1 border-l border-rule">
            {SECTIONS.map(([sid, label]) => (
              <li key={sid}>
                <a href={`#${sid}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-[0.88rem] text-ink-3 hover:border-ink hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-4xl space-y-6">
          {state.status === "error" ? (
            <div role="alert" className="border-l-2 border-signal bg-signal-soft px-4 py-3 text-[0.92rem]">
              <p className="font-medium">{state.message}</p>
              {Object.keys(err).length > 0 ? (
                <ul className="mono mt-2 space-y-0.5 text-[0.8rem]">
                  {Object.entries(err).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <Panel id="basics" title="Basics" description="What the register and previews show.">
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <TextField
                label="Title"
                value={p.title}
                error={err.title}
                onChange={(title) => set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) })}
              />
              <TextField label="File code" value={p.code} error={err.code} onChange={(code) => set({ code })} mono />
            </div>
            <TextField
              label="Slug (URL)"
              value={p.slug}
              error={err.slug}
              hint={`/work/${p.slug || "…"}`}
              onChange={(slug) => {
                setSlugTouched(true);
                set({ slug: slugify(slug) });
              }}
              mono
            />
            <TextArea label="Tagline" value={p.tagline} onChange={(tagline) => set({ tagline })} rows={2} hint="One sentence. Shown under the title everywhere." />
            <TextArea label="Summary" value={p.summary} onChange={(summary) => set({ summary })} rows={3} hint="Two or three sentences for previews and search results." />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Your role" value={p.role} onChange={(role) => set({ role })} placeholder="Architecture · backend · security review" />
              <TextField label="Timeframe" value={p.timeframe} onChange={(timeframe) => set({ timeframe })} placeholder="2025 to present" />
            </div>
            <fieldset>
              <legend className="label mb-2 text-ink-3">Domains</legend>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_KEYS.map((d) => {
                  const on = p.domains.includes(d);
                  return (
                    <label
                      key={d}
                      className={cx(
                        "mono cursor-pointer rounded-[4px] border px-2.5 py-1 text-[0.78rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                        on ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-2 hover:border-ink",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        onChange={(e) => set({ domains: e.target.checked ? [...p.domains, d] : p.domains.filter((x) => x !== d) })}
                      />
                      {DOMAINS[d].label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <TagInput
              label="Stack"
              value={p.stack}
              onChange={(stack) => set({ stack })}
              suggestions={ALL_TOOL_NAMES}
              hint="Tools that match the stack map (e.g. “Laravel”) link this project as evidence."
            />
          </Panel>

          <Panel id="coverage" title="Lifecycle coverage" description="Tick the stages your work covered. Notes appear on the case study.">
            <ol className="space-y-2">
              {LIFECYCLE.map((k) => {
                const on = k in p.coverage;
                return (
                  <li key={k} className="grid items-center gap-2 sm:grid-cols-[11rem_1fr]">
                    <Checkbox
                      label={lifecycle[k].label}
                      checked={on}
                      onChange={(v) => {
                        const next = { ...p.coverage };
                        if (v) next[k] = next[k] ?? "";
                        else delete next[k];
                        set({ coverage: next });
                      }}
                    />
                    <input
                      aria-label={`${lifecycle[k].label} note`}
                      disabled={!on}
                      value={p.coverage[k] ?? ""}
                      onChange={(e) => set({ coverage: { ...p.coverage, [k]: e.target.value } })}
                      className={cx(inputClass, "disabled:opacity-40")}
                      placeholder={on ? "What you did at this stage" : ""}
                      maxLength={160}
                    />
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel id="story" title="Problem & build" description="A project gets its own page once Problem has content.">
            <MarkdownField label="Problem" value={p.problem} onChange={(problem) => set({ problem })} error={err.problem} />
            <MarkdownField label="What I built" value={p.built} onChange={(built) => set({ built })} rows={10} />
          </Panel>

          <Panel id="system" title="System diagram" description="Rendered as an interactive schematic, with a text outline for small screens and screen readers.">
            <DiagramEditor value={p.diagram} onChange={(diagram) => set({ diagram })} />
          </Panel>

          <Panel id="decisions" title="Decisions" description="Architecture decision records: context, decision, trade-off.">
            <Repeater<Decision>
              items={p.decisions}
              onChange={(decisions) => set({ decisions })}
              make={() => ({ title: "", context: "", decision: "", tradeoff: "" })}
              addLabel="Add decision"
              itemLabel={(d) => d.title || "Untitled decision"}
              render={(d, update) => (
                <>
                  <TextField label="Title" value={d.title} onChange={(title) => update({ title })} />
                  <TextArea label="Context" value={d.context} onChange={(context) => update({ context })} rows={2} />
                  <TextArea label="Decision" value={d.decision} onChange={(decision) => update({ decision })} rows={2} />
                  <TextArea label="Trade-off" value={d.tradeoff} onChange={(tradeoff) => update({ tradeoff })} rows={2} />
                </>
              )}
            />
          </Panel>

          <Panel id="field-notes" title="Field notes" description="Hard bugs and how you found them: symptom → investigation → resolution.">
            <Repeater<Challenge>
              items={p.challenges}
              onChange={(challenges) => set({ challenges })}
              make={() => ({ title: "", symptom: "", investigation: "", resolution: "" })}
              addLabel="Add field note"
              itemLabel={(c) => c.title || "Untitled"}
              empty="None yet. This section stays hidden on the public page until you add one."
              render={(c, update) => (
                <>
                  <TextField label="Title" value={c.title} onChange={(title) => update({ title })} />
                  <TextArea label="Symptom" value={c.symptom} onChange={(symptom) => update({ symptom })} rows={2} />
                  <TextArea label="Investigation" value={c.investigation} onChange={(investigation) => update({ investigation })} rows={3} />
                  <TextArea label="Resolution" value={c.resolution} onChange={(resolution) => update({ resolution })} rows={2} />
                </>
              )}
            />
          </Panel>

          <Panel id="security" title="Break test & testing" description="How the system was attacked and verified. Outcomes only where there's evidence.">
            <MarkdownField label="Break test (security)" value={p.security} onChange={(security) => set({ security })} />
            <MarkdownField label="Testing & readiness" value={p.testing} onChange={(testing) => set({ testing })} rows={6} />
            <MarkdownField
              label="Outcomes"
              value={p.outcomes}
              onChange={(outcomes) => set({ outcomes })}
              rows={5}
              hint="Only measured, verifiable results. Leave empty and the section stays hidden."
            />
          </Panel>

          <Panel id="evidence" title="Evidence & links" description="Screenshots from the media library, and links to repos, demos or write-ups.">
            <Repeater<Evidence>
              items={p.evidence}
              onChange={(evidence) => set({ evidence })}
              make={() => (media[0] ? { kind: "image", mediaId: media[0].id, caption: "" } : { kind: "link", url: "", caption: "" })}
              addLabel="Add evidence"
              itemLabel={(e) => (e.kind === "image" ? "Image" : "Link") + (e.caption ? ` · ${e.caption}` : "")}
              render={(e, update) => (
                <>
                  <label className="label block text-ink-3">
                    Kind
                    <select
                      value={e.kind}
                      onChange={(ev) =>
                        update(
                          (ev.target.value === "image"
                            ? { kind: "image", mediaId: media[0]?.id ?? "", url: undefined }
                            : { kind: "link", url: "", mediaId: undefined }) as unknown as Partial<Evidence>,
                        )
                      }
                      className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                    >
                      <option value="image" disabled={media.length === 0}>
                        Image {media.length === 0 ? "(upload one in Media first)" : ""}
                      </option>
                      <option value="link">Link</option>
                    </select>
                  </label>
                  {e.kind === "image" ? (
                    <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                      {e.mediaId ? <img src={`/media/${e.mediaId}`} alt="" className="aspect-video w-24 rounded-[3px] border border-rule object-cover" /> : <span />}
                      <label className="label block text-ink-3">
                        Image
                        <select
                          value={e.mediaId}
                          onChange={(ev) => update({ mediaId: ev.target.value } as Partial<Evidence>)}
                          className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                        >
                          {media.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.alt || m.filename}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <TextField label="URL" value={e.url} onChange={(url) => update({ url } as Partial<Evidence>)} placeholder="https://" />
                  )}
                  <TextField label="Caption" value={e.caption} onChange={(caption) => update({ caption })} />
                </>
              )}
            />
            <div className="border-t border-rule pt-5">
              <p className="label mb-2 text-ink-3">Header links</p>
              <Repeater<ProjectLink>
                items={p.links}
                onChange={(links) => set({ links })}
                make={() => ({ label: "", url: "", kind: "live" })}
                addLabel="Add link"
                itemLabel={(l) => l.label || l.kind}
                render={(l, update) => (
                  <div className="grid gap-3 sm:grid-cols-[7rem_1fr_2fr]">
                    <label className="label block text-ink-3">
                      Kind
                      <select
                        value={l.kind}
                        onChange={(ev) => update({ kind: ev.target.value as ProjectLink["kind"] })}
                        className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                      >
                        {LINK_KINDS.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <TextField label="Label" value={l.label} onChange={(label) => update({ label })} placeholder="Live site" />
                    <TextField label="URL" value={l.url} onChange={(url) => update({ url })} placeholder="https://" />
                  </div>
                )}
              />
            </div>
          </Panel>

          <Panel id="publishing" title="Publishing">
            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="label mb-2 text-ink-3">Visibility</legend>
                <div className="flex gap-2">
                  {(["draft", "published"] as const).map((v) => (
                    <label
                      key={v}
                      className={cx(
                        "mono cursor-pointer rounded-[4px] border px-3 py-1.5 text-[0.8rem] capitalize has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
                        p.visibility === v ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-2",
                      )}
                    >
                      <input type="radio" className="sr-only" checked={p.visibility === v} onChange={() => set({ visibility: v })} />
                      {v}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="label block text-ink-3">
                Stage
                <select
                  value={p.stage ?? ""}
                  onChange={(e) => set({ stage: (e.target.value || null) as ProjectInput["stage"] })}
                  className={`${inputClass} mt-1.5 normal-case tracking-normal`}
                >
                  <option value="">Not shown</option>
                  {PROJECT_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Checkbox label="Featured on the homepage" checked={p.featured} onChange={(featured) => set({ featured })} hint="Only the first featured project is shown." />
              <Checkbox label="Needs review" checked={p.needsReview} onChange={(needsReview) => set({ needsReview })} hint="Shows the verify banner here. Never shown publicly." />
            </div>
            <TextField label="Order" type="number" value={String(p.sortOrder)} onChange={(v) => set({ sortOrder: Number(v) || 0 })} hint="Lower comes first. You can also reorder from the list." />
            <TextField label="SEO title (optional)" value={p.seoTitle} onChange={(seoTitle) => set({ seoTitle })} maxLength={120} />
            <TextArea label="SEO description (optional)" value={p.seoDescription} onChange={(seoDescription) => set({ seoDescription })} rows={2} />
          </Panel>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/95 backdrop-blur lg:left-60">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <p aria-live="polite" className="text-[0.88rem] text-ink-3">
            {pending
              ? "Saving…"
              : state.status === "ok" && !dirty
                ? state.message
                : dirty
                  ? "Unsaved changes"
                  : id
                    ? "All changes saved"
                    : "New project, not saved yet"}
          </p>
          <div className="flex items-center gap-2">
            {id ? (
              <Link href={`/admin/preview?project=${id}`} target="_blank" className={cx(buttonClass("secondary"), "min-h-10 px-3 text-[0.88rem]")}>
                Preview
              </Link>
            ) : null}
            <button type="submit" disabled={pending} className={cx(buttonClass("primary"), "min-h-10 px-4 text-[0.88rem]")}>
              {pending ? "Saving…" : id ? "Save" : "Create project"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
