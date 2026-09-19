import type { CaptureResult } from "posthog-js";

/**
 * Stack frame function names injected by Meta's in-app browser (the Facebook
 * and Instagram Android WebView). That browser injects a script which posts to
 * a native JavaScript bridge. When the bridge object is destroyed while the
 * script still posts to it, the WebView raises "Error invoking postMessage:
 * Java object is gone". The frames belong to Meta's injected script, not to
 * our code, so the exception is noise we cannot fix.
 */
const IN_APP_BROWSER_BRIDGE_FRAMES = new Set([
  "sendDataToNative",
  "sendJsBlockingTimeMessage",
]);

/**
 * Reports whether an event is a "Java object is gone" exception raised inside
 * Meta's in-app browser bridge. Used by `before_send` to drop the event before
 * it reaches PostHog error tracking.
 */
export function isMetaInAppBrowserException(event: CaptureResult | null): boolean {
  if (!event || event.event !== "$exception") {
    return false;
  }

  const exceptionList = event.properties?.$exception_list;
  if (!Array.isArray(exceptionList)) {
    return false;
  }

  return exceptionList.some((exception) => {
    const frames = exception?.stacktrace?.frames;
    if (!Array.isArray(frames)) {
      return false;
    }
    return frames.some(
      (frame) =>
        typeof frame?.function === "string" &&
        IN_APP_BROWSER_BRIDGE_FRAMES.has(frame.function)
    );
  });
}
