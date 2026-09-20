import { NextRequest, NextResponse } from "next/server";
import { sanitizeTelemetryEvent } from "@/lib/privacy-settings";
import { logger, getRequestId, childLogger } from "@/lib/logger";

// Auth + client telemetry sink. Events are sanitized (no PII/secrets) before
// they reach us. OAuth failures log at error level so they surface in Vercel.
export async function POST(req: NextRequest) {
  const log = childLogger(logger, getRequestId(req.headers));
  const event = sanitizeTelemetryEvent(await req.json().catch(() => null));
  if (!event) {
    log.warn({ route: "/api/telemetry" }, "rejected malformed telemetry event");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = { ...event, ts: new Date().toISOString() };
  if (event.event === "oauth_callback_timeout" || event.status === "error") {
    log.error(payload, "auth telemetry error");
  } else {
    log.info(payload, "telemetry");
  }

  return NextResponse.json({ ok: true });
}
