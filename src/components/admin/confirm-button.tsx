"use client";

import type { ReactNode } from "react";

/** A submit button that asks before a destructive action. */
export function ConfirmButton({ message, children }: { message: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="mono rounded-[4px] border border-rule-strong px-3 py-1.5 text-[0.8rem] text-ink-2 hover:border-signal hover:text-signal-ink"
    >
      {children}
    </button>
  );
}
