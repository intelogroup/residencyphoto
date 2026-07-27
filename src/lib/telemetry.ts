// Fire-and-forget signal for things we can't otherwise see once this ships:
// did the on-device ML models actually load for this user? Never send image
// data or anything photo-derived — event name + timing + error text only.
export function reportModelEvent(
  event: string,
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
