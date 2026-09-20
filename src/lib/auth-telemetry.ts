// Fire-and-forget signal for the OAuth callback page: did the handshake
// finish, or did the user stare at the vendor spinner until it timed out?
// Same sanitized pipeline as model telemetry — event name + status +
// duration only. Never send codes, tokens, emails, or callback param values.
export function reportAuthEvent(
  event: "oauth_callback_started" | "oauth_callback_timeout",
  data: { status: "success" | "error"; durationMs?: number }
) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ event, ...data });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/telemetry", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/telemetry", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}
