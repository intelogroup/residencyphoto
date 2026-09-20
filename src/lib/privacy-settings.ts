export const PHOTO_HISTORY_KEY = "eras_photo_history_enabled";

const ALLOWED_TELEMETRY_EVENTS = new Set([
  "face_landmarker_load",
  "image_classifier_load",
  // OAuth callback lifecycle: name + status + duration only, never tokens,
  // codes, emails, or any callback param values.
  "oauth_callback_started",
  "oauth_callback_timeout",
]);

export function isPhotoHistoryEnabled(): boolean {
  return localStorage.getItem(PHOTO_HISTORY_KEY) !== "false";
}

export function setPhotoHistoryEnabled(enabled: boolean): void {
  localStorage.setItem(PHOTO_HISTORY_KEY, String(enabled));
}

export function isAllowedTelemetryEvent(event: string): boolean {
  return ALLOWED_TELEMETRY_EVENTS.has(event);
}

export function sanitizeTelemetryEvent(value: unknown): {
  event: string;
  status: "success" | "error";
  durationMs?: number;
} | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.event !== "string" || !isAllowedTelemetryEvent(record.event)) return null;
  if (record.status !== "success" && record.status !== "error") return null;

  const durationMs =
    typeof record.durationMs === "number" && Number.isFinite(record.durationMs)
      ? Math.max(0, Math.min(300_000, Math.round(record.durationMs)))
      : undefined;

  return {
    event: record.event,
    status: record.status,
    ...(durationMs === undefined ? {} : { durationMs }),
  };
}
