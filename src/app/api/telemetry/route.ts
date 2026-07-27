import { NextRequest, NextResponse } from "next/server";
import { sanitizeTelemetryEvent } from "@/lib/privacy-settings";

// ponytail: console.log only, Vercel captures function logs — add a real
// sink (Sentry, ClickHouse, etc.) if/when we need dashboards or alerting.
export async function POST(req: NextRequest) {
  const event = sanitizeTelemetryEvent(await req.json().catch(() => null));
  if (!event) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  console.log("[telemetry]", JSON.stringify({ ...event, ts: new Date().toISOString() }));

  return NextResponse.json({ ok: true });
}
