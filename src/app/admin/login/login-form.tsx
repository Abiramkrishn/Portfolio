"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../auth-actions";
import { buttonClass, cx } from "@/components/ui/primitives";

const input =
  "w-full rounded-[4px] border border-rule-strong bg-card px-3.5 py-2.5 text-ink focus:border-ink focus:outline-none";

export function LoginForm({ totp }: { totp: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="label mb-1.5 block text-ink-3">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email ?? ""}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="password" className="label mb-1.5 block text-ink-3">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {totp ? (
        <div>
          <label htmlFor="code" className="label mb-1.5 block text-ink-3">
            Authenticator code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            required
            className={cx(input, "mono tracking-[0.3em]")}
          />
        </div>
      ) : null}
      <div aria-live="polite">
        {state.error ? (
          <p role="alert" className="border-l-2 border-signal bg-signal-soft px-3 py-2 text-[0.9rem]">
            {state.error}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={cx(buttonClass("primary"), "w-full")}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
