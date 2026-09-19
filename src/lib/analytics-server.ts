/**
 * Server-side PostHog event capture.
 *
 * Used by webhooks and API routes where there is no browser-side posthog-js
 * instance (e.g. the Stripe webhook). Events are sent directly to
 * us.posthog.com with the project API key.
 *
 * This module must never break the caller: every failure mode is swallowed
 * and logged, so analytics can never fail a payment webhook.
 */

const POSTHOG_CAPTURE_URL = "https://us.posthog.com/capture/";
const CAPTURE_TIMEOUT_MS = 5000;

export interface ServerAnalyticsEvent {
  event: string;
  /** PostHog distinct_id. Use the Neon Auth user id so server events merge with client-side identified events. */
  distinctId: string;
  properties?: Record<string, unknown>;
}

export async function captureServerEvent({
  event,
  distinctId,
  properties,
}: ServerAnalyticsEvent): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!apiKey || !distinctId) return;

  try {
    const response = await fetch(POSTHOG_CAPTURE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: {
          $lib: "residencyphoto-server",
          ...properties,
        },
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(CAPTURE_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`[analytics] PostHog capture failed for "${event}": HTTP ${response.status}`);
    }
  } catch (error) {
    console.error(`[analytics] PostHog capture failed for "${event}"`, error);
  }
}
