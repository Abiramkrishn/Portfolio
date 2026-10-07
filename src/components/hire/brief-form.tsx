"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitBrief, type BriefState } from "@/app/(site)/hire/actions";
import { ENGAGEMENT_KEYS, briefOptions, engagements, type EngagementKey } from "@/content/site";
import { buttonClass, cx } from "@/components/ui/primitives";
import { useQueryParam } from "@/components/hooks";
import { ArrowRight, Check } from "@/components/ui/icons";

const initial: BriefState = { status: "idle" };

export function BriefForm({ responseTime }: { responseTime: string }) {
  const [state, action, pending] = useActionState(submitBrief, initial);
  const [token, setToken] = useState("");
  const typeParam = useQueryParam("type");
  const [chosen, setChosen] = useState<EngagementKey[] | null>(null);
  // Until the visitor touches the checkboxes, ?type= from a deep link decides the selection.
  const selected =
    chosen ?? (typeParam && (ENGAGEMENT_KEYS as string[]).includes(typeParam) ? [typeParam as EngagementKey] : []);
  const setSelected = (update: (s: EngagementKey[]) => EngagementKey[]) => setChosen(update(selected));
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Fetch a signed form token in the browser, so the page itself stays static.
  useEffect(() => {
    fetch("/api/form-token", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { token: string }) => setToken(d.token))
      .catch(() => setToken(""));
  }, []);

  useEffect(() => {
    if (state.status === "error") {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      (firstInvalid ?? statusRef.current)?.focus();
    }
    if (state.status === "ok") statusRef.current?.focus();
  }, [state]);

  if (state.status === "ok") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="reg-marks border border-rule bg-card p-6 outline-none md:p-8">
        <p className="label flex items-center gap-2 text-ok">
          <Check /> Brief received
        </p>
        <p className="title mt-4">Thank you, it&apos;s in my inbox.</p>
        <ol className="mt-6 space-y-3 text-[0.95rem] text-ink-2">
          <li className="flex gap-3">
            <span className="label pt-0.5 text-signal-ink">01</span>I read it properly. No auto-responder.
          </li>
          <li className="flex gap-3">
            <span className="label pt-0.5 text-signal-ink">02</span>I reply {responseTime}, with questions or a
            suggested first step.
          </li>
          <li className="flex gap-3">
            <span className="label pt-0.5 text-signal-ink">03</span>If it&apos;s a fit, we agree something small and
            concrete to start.
          </li>
        </ol>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = state.errors ?? {};
  const field = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": err[name] ? (true as const) : undefined,
    "aria-describedby": err[name] ? `${uid}-${name}-err` : undefined,
  });
  const inputClass =
    "w-full rounded-[4px] border border-rule-strong bg-card px-3.5 py-2.5 text-[1rem] text-ink placeholder:text-ink-3 transition-colors focus:border-ink focus:outline-none aria-[invalid=true]:border-signal";

  return (
    <form ref={formRef} action={action} noValidate className="space-y-9">
      <input type="hidden" name="token" value={token} />
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <fieldset>
        <legend className="label text-ink-3">
          <span className="text-signal-ink">01</span> · What kind of work? <span className="normal-case">(pick any)</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ENGAGEMENT_KEYS.map((key) => {
            const checked = selected.includes(key);
            return (
              <label
                key={key}
                className={cx(
                  "flex cursor-pointer gap-3 rounded-[4px] border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                  checked ? "border-ink bg-card" : "border-rule-strong hover:border-ink",
                )}
              >
                <input
                  type="checkbox"
                  name="engagements"
                  value={key}
                  checked={checked}
                  onChange={(e) =>
                    setSelected((s) => (e.target.checked ? [...s, key] : s.filter((k) => k !== key)))
                  }
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border",
                    checked ? "border-ink bg-ink text-paper" : "border-rule-strong",
                  )}
                >
                  {checked ? <Check size={11} /> : null}
                </span>
                <span>
                  <span className="block font-medium text-ink">{engagements[key].label}</span>
                  <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-2">{engagements[key].summary}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label text-ink-3">
          <span className="text-signal-ink">02</span> · Where are you now?
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {briefOptions.currentState.map((opt) => (
            <label
              key={opt}
              className="mono cursor-pointer rounded-[4px] border border-rule-strong px-3 py-2 text-[0.8rem] text-ink-2 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal"
            >
              <input
                type="radio"
                name="currentState"
                value={opt}
                defaultChecked={v.currentState === opt}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-message`} className="label block text-ink-3">
          <span className="text-signal-ink">03</span> · What are you trying to do?
        </label>
        <p id={`${uid}-message-hint`} className="mt-1.5 text-[0.88rem] text-ink-3">
          The problem, what exists today, and what &ldquo;done&rdquo; looks like. Plain language is fine.
        </p>
        <textarea
          {...field("message")}
          aria-describedby={cx(`${uid}-message-hint`, err.message && `${uid}-message-err`) || undefined}
          rows={7}
          required
          minLength={30}
          maxLength={5000}
          defaultValue={(v.message as string) ?? ""}
          className={cx(inputClass, "mt-3 resize-y leading-relaxed")}
        />
        <FieldError id={`${uid}-message-err`} message={err.message} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-timeline`} className="label block text-ink-3">
            <span className="text-signal-ink">04</span> · Timeline
          </label>
          <select {...field("timeline")} defaultValue={(v.timeline as string) ?? ""} className={cx(inputClass, "mt-3")}>
            <option value="">Not sure yet</option>
            {briefOptions.timeline.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-budget`} className="label block text-ink-3">
            <span className="text-signal-ink">05</span> · Rough budget <span className="normal-case">(optional)</span>
          </label>
          <input
            {...field("budget")}
            type="text"
            maxLength={120}
            defaultValue={(v.budget as string) ?? ""}
            placeholder="A range is fine"
            className={cx(inputClass, "mt-3")}
          />
        </div>
      </div>

      <fieldset>
        <legend className="label text-ink-3">
          <span className="text-signal-ink">06</span> · Who&apos;s asking?
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className="mb-1.5 block text-[0.88rem] text-ink-2">
              Name
            </label>
            <input {...field("name")} type="text" autoComplete="name" required maxLength={120} defaultValue={(v.name as string) ?? ""} className={inputClass} />
            <FieldError id={`${uid}-name-err`} message={err.name} />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className="mb-1.5 block text-[0.88rem] text-ink-2">
              Email
            </label>
            <input {...field("email")} type="email" autoComplete="email" required maxLength={200} defaultValue={(v.email as string) ?? ""} className={inputClass} />
            <FieldError id={`${uid}-email-err`} message={err.email} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-company`} className="mb-1.5 block text-[0.88rem] text-ink-2">
              Company or project <span className="text-ink-3">(optional)</span>
            </label>
            <input {...field("company")} type="text" autoComplete="organization" maxLength={160} defaultValue={(v.company as string) ?? ""} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {state.status === "error" && state.message ? (
          <p role="alert" className="border-l-2 border-signal bg-signal-soft px-4 py-3 text-[0.95rem] text-ink">
            {state.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? "Sending…" : "Send the brief"}
          <ArrowRight />
        </button>
        <p className="text-[0.85rem] text-ink-3">Your details are used only to reply to you.</p>
      </div>
      <noscript>
        <p className="text-[0.9rem] text-ink-2">
          This form needs JavaScript to protect against spam. If it&apos;s disabled, use one of the direct
          channels instead.
        </p>
      </noscript>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.85rem] text-signal-ink">
      {message}
    </p>
  );
}
