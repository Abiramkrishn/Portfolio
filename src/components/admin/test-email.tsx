"use client";

import { useActionState } from "react";
import { testEmail, type TestEmailState } from "@/app/admin/(protected)/settings/actions";
import { buttonClass, cx } from "@/components/ui/primitives";
import { Panel } from "./ui";

/** Sends a real email through the configured SMTP account and reports exactly what happened. */
export function TestEmail({ configured, to }: { configured: boolean; to: string | null }) {
  const [state, action, pending] = useActionState<TestEmailState, FormData>(testEmail, { status: "idle" });
  return (
    <div className="max-w-3xl px-4 pb-10 md:px-8">
      <Panel
        title="Email delivery"
        description={
          configured && to
            ? `New briefs are emailed to ${to}. Send a test to make sure it arrives.`
            : "Not set up yet. Briefs are still saved to the inbox; see the README section “Get briefs in Gmail”."
        }
      >
        <form action={action} className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || !configured}
            className={cx(buttonClass("secondary"), "min-h-10 px-4 text-[0.9rem]")}
          >
            {pending ? "Sending…" : "Send test email"}
          </button>
          <p
            aria-live="polite"
            className={cx(
              "text-[0.88rem]",
              state.status === "error" ? "text-signal-ink" : state.status === "ok" ? "text-ok" : "text-ink-3",
            )}
          >
            {state.message}
          </p>
        </form>
      </Panel>
    </div>
  );
}
