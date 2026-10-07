"use client";

import { useId, useState, type ReactNode } from "react";
import { Markdown } from "@/components/markdown";
import { cx } from "@/components/ui/primitives";
import { Close, Plus } from "@/components/ui/icons";
import { inputClass } from "./ui";

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  maxLength,
  mono,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
  type?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label mb-1.5 block text-ink-3">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputClass, mono && "mono")}
      />
      {hint && !error ? <p className="mt-1 text-[0.8rem] text-ink-3">{hint}</p> : null}
      {error ? <p className="mt-1 text-[0.8rem] text-signal-ink">{error}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  error?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label mb-1.5 block text-ink-3">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputClass, "resize-y leading-relaxed")}
      />
      {hint && !error ? <p className="mt-1 text-[0.8rem] text-ink-3">{hint}</p> : null}
      {error ? <p className="mt-1 text-[0.8rem] text-signal-ink">{error}</p> : null}
    </div>
  );
}

/** Markdown textarea with a Write / Preview switch, rendered exactly as the public site renders it. */
export function MarkdownField({
  label,
  value,
  onChange,
  rows = 8,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const [mode, setMode] = useState<"write" | "preview">("write");
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="label text-ink-3">
          {label}
        </label>
        <div className="flex gap-1" role="group" aria-label={`${label}: mode`}>
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cx(
                "mono rounded-[3px] px-2 py-0.5 text-[0.72rem] capitalize",
                mode === m ? "bg-ink text-paper" : "text-ink-3 hover:text-ink",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {mode === "write" ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cx(inputClass, "mono resize-y text-[0.85rem] leading-relaxed")}
        />
      ) : (
        <div className="min-h-24 rounded-[4px] border border-rule bg-paper p-4">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-[0.9rem] text-ink-3">Nothing to preview.</p>}
        </div>
      )}
      <p className="mt-1 text-[0.8rem] text-ink-3">
        {error ? <span className="text-signal-ink">{error}</span> : (hint ?? "Markdown: **bold**, - lists, [links](https://…). Raw HTML is ignored.")}
      </p>
    </div>
  );
}

/** Free-text tags with suggestions. Enter or comma adds; Backspace on empty removes the last. */
export function TagInput({
  label,
  value,
  onChange,
  suggestions = [],
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const t = raw.trim().replace(/,$/, "");
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <label htmlFor={id} className="label mb-1.5 block text-ink-3">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-[4px] border border-rule-strong bg-paper p-1.5 focus-within:border-ink">
        {value.map((tag) => (
          <span key={tag} className="mono inline-flex items-center gap-1 rounded-[3px] bg-paper-2 py-0.5 pr-1 pl-2 text-[0.78rem]">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== tag))}
              className="rounded-[2px] p-0.5 text-ink-3 hover:text-signal-ink"
              aria-label={`Remove ${tag}`}
            >
              <Close size={11} />
            </button>
          </span>
        ))}
        <input
          id={id}
          list={`${id}-list`}
          value={draft}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
          className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-[0.92rem] outline-none"
          placeholder="Type and press Enter"
        />
        <datalist id={`${id}-list`}>
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      </div>
      {hint ? <p className="mt-1 text-[0.8rem] text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 accent-[var(--signal)]" />
      <span>
        <span className="block text-[0.95rem]">{label}</span>
        {hint ? <span className="block text-[0.8rem] text-ink-3">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Ordered list editor: add, remove and reorder rows of any shape. */
export function Repeater<T>({
  items,
  onChange,
  make,
  render,
  addLabel,
  itemLabel,
  empty,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel: string;
  itemLabel: (item: T, index: number) => string;
  empty?: string;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.length === 0 && empty ? <p className="text-[0.9rem] text-ink-3">{empty}</p> : null}
      {items.map((item, i) => (
        <div key={i} className="rounded-[4px] border border-rule bg-paper">
          <div className="flex items-center justify-between gap-2 border-b border-rule px-3 py-1.5">
            <span className="label truncate text-ink-3">
              <span className="text-signal-ink">{String(i + 1).padStart(2, "0")}</span> · {itemLabel(item, i)}
            </span>
            <span className="flex shrink-0 gap-1">
              <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </IconButton>
              <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                ↓
              </IconButton>
              <IconButton label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Close size={12} />
              </IconButton>
            </span>
          </div>
          <div className="space-y-4 p-3">{render(item, (patch) => update(i, patch), i)}</div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, make()])}
        className="mono inline-flex items-center gap-1.5 rounded-[4px] border border-dashed border-rule-strong px-3 py-1.5 text-[0.8rem] text-ink-2 hover:border-ink hover:text-ink"
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="mono inline-flex size-7 items-center justify-center rounded-[3px] text-[0.85rem] text-ink-3 hover:bg-paper-2 hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
