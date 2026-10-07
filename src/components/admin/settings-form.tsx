"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/admin/(protected)/settings/actions";
import type { SiteSettings } from "@/lib/types";
import { buttonClass, cx } from "@/components/ui/primitives";
import { Field, Panel, inputClass } from "./ui";

export function SettingsForm({ initial, mailConfigured }: { initial: SiteSettings; mailConfigured: boolean }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, { status: "idle" });
  const err = state.errors ?? {};
  const text = (name: keyof SiteSettings, label: string, opts: { hint?: string; placeholder?: string; type?: string } = {}) => (
    <Field label={label} htmlFor={name} hint={opts.hint} error={err[name]}>
      <input
        id={name}
        name={name}
        type={opts.type ?? "text"}
        defaultValue={String(initial[name] ?? "")}
        placeholder={opts.placeholder}
        aria-invalid={err[name] ? true : undefined}
        className={inputClass}
      />
    </Field>
  );

  return (
    <form action={action} className="max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <Panel title="Availability" description="Shown in the header, hero, footer and on the hire page.">
        <fieldset>
          <legend className="label mb-2 text-ink-3">Status</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["open", "Available for new projects"],
                ["limited", "Limited availability"],
                ["closed", "Not taking new work"],
              ] as const
            ).map(([v, label]) => (
              <label
                key={v}
                className="mono cursor-pointer rounded-[4px] border border-rule-strong px-3 py-1.5 text-[0.8rem] text-ink-2 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal"
              >
                <input type="radio" name="availability" value={v} defaultChecked={initial.availability === v} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {text("availabilityNote", "Note (optional)", { placeholder: "e.g. from November 2026", hint: "Appended after the status." })}
        {text("responseTime", "Reply time promise", { hint: "Used in “I'll reply …”. Keep it true.", placeholder: "within two working days" })}
      </Panel>

      <Panel title="Contact channels" description="Only filled-in channels are shown publicly.">
        {text("email", "Email", { type: "email" })}
        {text("phone", "Phone number", { placeholder: "+91 98765 43210", hint: "Shown as a tap-to-call link." })}
        {text("whatsapp", "WhatsApp number", { placeholder: "+91 98765 43210", hint: "International format. Links to wa.me." })}
        {text("linkedin", "LinkedIn URL", { placeholder: "https://www.linkedin.com/in/…" })}
        {text("github", "GitHub URL", { placeholder: "https://github.com/…" })}
        {text("bookingUrl", "Booking link (optional)", { placeholder: "https://cal.com/…" })}
        {text("cvUrl", "CV / résumé URL (optional)")}
      </Panel>

      <Panel title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("location", "Location", { placeholder: "City, Country" })}
          {text("timezone", "Time zone", { placeholder: "IST (UTC+5:30)" })}
        </div>
        <Field label="Now (Markdown, optional)" htmlFor="now" hint="What you're working on or learning. Shown on /about." error={err.now}>
          <textarea id="now" name="now" rows={4} defaultValue={initial.now} className={cx(inputClass, "mono text-[0.85rem]")} />
        </Field>
      </Panel>

      <Panel title="Notifications">
        <label className="flex items-start gap-2.5">
          <input type="checkbox" name="notifyOnInquiry" defaultChecked={initial.notifyOnInquiry} className="mt-1 size-4 accent-[var(--signal)]" />
          <span>
            <span className="block">Email me when a brief arrives</span>
            <span className="block text-[0.8rem] text-ink-3">
              {mailConfigured
                ? "Email is configured. Use “Send test email” below to check delivery."
                : "Email isn’t configured yet (SMTP settings in the environment). Briefs are always saved to the inbox either way."}
            </span>
          </span>
        </label>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={cx(buttonClass("primary"), "min-h-10 px-4 text-[0.9rem]")}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        <p aria-live="polite" className={cx("text-[0.88rem]", state.status === "error" ? "text-signal-ink" : "text-ink-3")}>
          {state.message}
        </p>
      </div>
    </form>
  );
}
