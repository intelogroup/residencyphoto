import { describe, expect, it } from "vitest";
import { isAllowedTelemetryEvent, sanitizeTelemetryEvent } from "./privacy-settings";

describe("telemetry privacy controls", () => {
  it("only permits known model-loading events", () => {
    expect(isAllowedTelemetryEvent("face_landmarker_load")).toBe(true);
    expect(isAllowedTelemetryEvent("image_classifier_load")).toBe(true);
    expect(isAllowedTelemetryEvent("photo_filename.jpg")).toBe(false);
  });

  it("drops arbitrary details and bounds duration", () => {
    expect(sanitizeTelemetryEvent({
      event: "image_classifier_load",
      status: "error",
      detail: "blob:https://example.test/private-photo",
      durationMs: 1234.9,
      filename: "private-photo.jpg",
    })).toEqual({
      event: "image_classifier_load",
      status: "error",
      durationMs: 1235,
    });
  });

  it("rejects malformed or unknown telemetry", () => {
    expect(sanitizeTelemetryEvent({ event: "unknown", status: "success" })).toBeNull();
    expect(sanitizeTelemetryEvent({ event: "face_landmarker_load", status: "maybe" })).toBeNull();
  });
});
