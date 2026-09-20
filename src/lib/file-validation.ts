/**
 * Upload file validation.
 *
 * Browsers cannot decode HEIC/HEIF in <img> or canvas, so accepting those
 * files only produces a dead editor later. Reject them at selection time —
 * by MIME type AND file extension, since iOS Safari reports the type
 * inconsistently — with a message that names what to do instead.
 */

export const HEIC_REJECTION_MESSAGE =
  "Please choose a JPG or PNG photo — HEIC files from iPhones aren't supported yet. " +
  "In Photos, share or export the picture as JPEG and try again.";

const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif"]);
const HEIC_EXTENSIONS = [".heic", ".heif"];

/** True when the file is HEIC/HEIF by MIME type or by extension. */
export function isHeicFile(file: { type?: string | null; name?: string | null }): boolean {
  const mime = (file.type ?? "").toLowerCase().trim();
  if (HEIC_MIME_TYPES.has(mime)) return true;
  const name = (file.name ?? "").toLowerCase();
  return HEIC_EXTENSIONS.some((ext) => name.endsWith(ext));
}
