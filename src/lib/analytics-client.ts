/**
 * Client-side PostHog helpers.
 *
 * Thin, never-throwing wrappers around the posthog-js instance initialized
 * in <PostHogProvider>. Analytics must never break a product flow, so every
 * failure here is swallowed and logged, never rethrown.
 */
import posthog from "posthog-js";

export interface AnalyticsContext {
  /** Current route, e.g. "/dashboard". Defaults to window.location.pathname. */
  route?: string;
  /** Component or user action, e.g. "download_authorize". */
  action?: string;
  /** Extra sanitized properties. Must not contain credentials, tokens, or PII. */
  extra?: Record<string, unknown>;
}

function isReady(): boolean {
  try {
    return Boolean((posthog as unknown as { __loaded?: boolean }).__loaded);
  } catch {
    return false;
  }
}

function baseProperties(context: AnalyticsContext = {}): Record<string, unknown> {
  const props: Record<string, unknown> = { $lib: "residencyphoto-web" };
  if (context.action) props.action = context.action;
  if (context.route) {
    props.route = context.route;
  } else if (typeof window !== "undefined") {
    props.route = window.location.pathname;
  }
  if (context.extra) Object.assign(props, context.extra);
  return props;
}

/** Capture a product/funnel event. Safe to call anywhere, even before init. */
export function trackEvent(event: string, context: AnalyticsContext = {}): void {
  try {
    if (!isReady()) return;
    posthog.capture(event, baseProperties(context));
  } catch (error) {
    console.error(`[analytics] trackEvent "${event}" failed`, error);
  }
}

/**
 * Redact anything credential-shaped before it ever reaches PostHog.
 * Strips emails, long opaque tokens, and key=value secrets; caps length.
 */
export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/(token|secret|password|code|session|api[-_ ]?key|client[-_ ]?secret)\s*[:=]\s*[^\s&;,}"]+/gi, "$1=[redacted]")
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[token]")
    .slice(0, 500);
}

function viewportSize(): string | undefined {
  try {
    return `${window.innerWidth}x${window.innerHeight}`;
  } catch {
    return undefined;
  }
}

/**
 * Explicit exception capture with sanitized context.
 *
 * Call this at real failure points (auth callback, download authorize,
 * editor load, checkout session creation) instead of relying on
 * PostHog autocapture, which currently records $exception events with
 * empty messages.
 */
export function captureException(error: unknown, context: AnalyticsContext = {}): void {
  try {
    if (!isReady()) return;
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    posthog.capture("$exception", {
      ...baseProperties(context),
      $exception_message: sanitizeErrorMessage(message),
      $exception_type: error instanceof Error ? error.name : typeof error,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : undefined,
      viewport: viewportSize(),
    });
  } catch (captureError) {
    console.error("[analytics] captureException failed", captureError);
  }
}
