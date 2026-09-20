import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { sanitizeTelemetryEvent } from "@/lib/privacy-settings";
import { logger, getRequestId, childLogger } from "@/lib/logger";

// Auth + client telemetry sink. Events are sanitized (no PII/secrets) before
// they reach us. OAuth failures go to Sentry (error tracking) and pino
// (structured Vercel logs) so both surfaces show the failure.
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
    Sentry.captureMessage(`auth telemetry error: ${event.event}`, {
      level: "error",
      extra: payload,
    });
  } else {
    log.info(payload, "telemetry");
  }

  return NextResponse.json({ ok: true });
}
