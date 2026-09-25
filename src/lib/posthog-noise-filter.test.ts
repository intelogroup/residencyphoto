import { describe, expect, it } from "vitest";
import type { CaptureResult } from "posthog-js";
import { isMetaInAppBrowserException } from "./posthog-noise-filter";

function exceptionEvent(frameFunctions: string[]): CaptureResult {
  return {
    uuid: "00000000-0000-0000-0000-000000000000",
    event: "$exception",
    properties: {
      $exception_list: [
        {
          type: "Error",
          value: "Error invoking postMessage: Java object is gone",
          stacktrace: {
            type: "raw",
            frames: frameFunctions.map((fn) => ({ function: fn })),
          },
        },
      ],
    },
  } as CaptureResult;
}

describe("isMetaInAppBrowserException", () => {
  it("drops the Meta in-app browser bridge exception", () => {
    const event = exceptionEvent(["sendDataToNative", "sendJsBlockingTimeMessage"]);
    expect(isMetaInAppBrowserException(event)).toBe(true);
  });

  it("drops when only one bridge frame is present", () => {
    expect(isMetaInAppBrowserException(exceptionEvent(["sendDataToNative"]))).toBe(true);
  });

  it("keeps a genuine application exception", () => {
    const event = exceptionEvent(["uploadPhoto", "handleSubmit"]);
    expect(isMetaInAppBrowserException(event)).toBe(false);
  });

  it("keeps non-exception events", () => {
    const event = {
      uuid: "00000000-0000-0000-0000-000000000000",
      event: "$pageview",
      properties: {},
    } as CaptureResult;
    expect(isMetaInAppBrowserException(event)).toBe(false);
  });

  it("keeps an exception with no stack frames", () => {
    const event = {
      uuid: "00000000-0000-0000-0000-000000000000",
      event: "$exception",
      properties: { $exception_list: [{ type: "Error", value: "boom" }] },
    } as CaptureResult;
    expect(isMetaInAppBrowserException(event)).toBe(false);
  });

  it("tolerates a null event", () => {
    expect(isMetaInAppBrowserException(null)).toBe(false);
  });
});
