"use client";

import { useActionState, useRef, useState } from "react";
import { uploadMedia, type UploadState } from "@/app/admin/(protected)/media/actions";
import { buttonClass, cx } from "@/components/ui/primitives";
import { inputClass } from "./ui";

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [state, action, pending] = useActionState<UploadState, FormData>(async (prev, fd) => {
    const result = await uploadMedia(prev, fd);
    if (result.status === "ok") {
      formRef.current?.reset();
      setPreview(null);
    }
    return result;
  }, { status: "idle" });

  const onFile = (file: File | undefined) => setPreview(file ? URL.createObjectURL(file) : null);

  return (
    <form ref={formRef} action={action} className="rounded-[6px] border border-rule bg-card/60 p-4">
      <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={() => setDragging(false)}
          className={cx(
            "relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-dashed text-center text-[0.85rem] text-ink-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal",
            dragging ? "border-signal bg-signal-soft" : "border-rule-strong hover:border-ink",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          {preview ? <img src={preview} alt="" className="absolute inset-0 h-full w-full object-contain" /> : <span className="px-3">Drop an image here or click to choose</span>}
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            required
            onChange={(e) => onFile(e.target.files?.[0])}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <div className="space-y-3">
          <div>
            <label htmlFor="alt" className="label mb-1.5 block text-ink-3">
              Alt text (required)
            </label>
            <input id="alt" name="alt" required maxLength={300} className={inputClass} placeholder="What the image shows, for someone who can't see it" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={pending} className={cx(buttonClass("primary"), "min-h-9 px-3 text-[0.88rem]")}>
              {pending ? "Processing…" : "Upload"}
            </button>
            <p aria-live="polite" className={cx("text-[0.85rem]", state.status === "error" ? "text-signal-ink" : "text-ink-3")}>
              {state.message ?? "JPEG, PNG, WebP, AVIF or GIF, up to 8 MB."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
