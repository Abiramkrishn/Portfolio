import "server-only";
import sharp from "sharp";
import { sha256 } from "./crypto";

// Vercel functions refuse request bodies over 4.5 MB, so uploads there stop at 4 MB.
export const MAX_UPLOAD_MB = process.env.VERCEL ? 4 : 8;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const ACCEPTED = new Set(["jpeg", "png", "webp", "avif", "gif", "tiff", "heif"]);

export class MediaError extends Error {}

/**
 * Decode, auto-orient, bound to 2400px and re-encode as WebP. Re-encoding drops every
 * metadata block (EXIF, GPS, ICC comments) and anything smuggled after the image data.
 * SVG is refused outright: it is a document that can carry script, not an image.
 */
export async function processImage(input: Buffer) {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new MediaError(`Images must be ${MAX_UPLOAD_MB} MB or smaller.`);
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: 50_000_000 }).metadata();
  } catch {
    throw new MediaError("That file isn't an image this site can read.");
  }
  if (!meta.format || !ACCEPTED.has(meta.format)) {
    throw new MediaError("Upload a JPEG, PNG, WebP, AVIF or GIF. SVG isn't accepted.");
  }
  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000, animated: false })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return {
    id: sha256(data).slice(0, 32),
    data,
    mime: "image/webp",
    width: info.width,
    height: info.height,
    size: data.byteLength,
  };
}
