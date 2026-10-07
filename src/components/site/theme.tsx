"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/primitives";
import { Monitor, Moon, Sun } from "@/components/ui/icons";

type Choice = "system" | "light" | "dark";

function readChoice(): Choice {
  try {
    const t = localStorage.getItem("theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function apply(choice: Choice) {
  const root = document.documentElement;
  try {
    if (choice === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", choice);
  } catch {
    /* storage blocked: still apply for this page view */
  }
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
  window.dispatchEvent(new Event("themechange"));
}

function useThemeChoice() {
  const [choice, setChoice] = useState<Choice>("system");
  useEffect(() => {
    const sync = () => setChoice(readChoice());
    sync();
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);
  return choice;
}

function effectiveDark(choice: Choice) {
  if (choice !== "system") return choice === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Compact header control: flips between light and dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const choice = useThemeChoice();
  return (
    <button
      type="button"
      onClick={() => apply(effectiveDark(choice) ? "light" : "dark")}
      className={cx(
        "inline-flex size-10 items-center justify-center rounded-[4px] text-ink-2 transition-colors hover:text-ink",
        className,
      )}
      aria-label="Switch between light and dark theme"
    >
      <Sun className="when-dark" />
      <Moon className="when-light" />
    </button>
  );
}

/** Footer control with an explicit "follow the system" option. */
export function ThemeChooser() {
  const choice = useThemeChoice();
  const options: { value: Choice; label: string; Icon: typeof Sun }[] = [
    { value: "system", label: "System", Icon: Monitor },
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-[4px] border border-rule p-0.5">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          onClick={() => apply(value)}
          className={cx(
            "mono inline-flex min-h-8 items-center gap-1.5 rounded-[3px] px-2.5 text-[0.72rem] transition-colors",
            choice === value ? "bg-ink text-paper" : "text-ink-3 hover:text-ink",
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}
