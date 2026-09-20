import { describe, expect, it } from "vitest";
import { HEIC_REJECTION_MESSAGE, isHeicFile } from "./file-validation";

describe("isHeicFile", () => {
  it("detects HEIC by MIME type", () => {
    expect(isHeicFile({ type: "image/heic", name: "photo.jpg" })).toBe(true);
    expect(isHeicFile({ type: "image/heif", name: "photo.png" })).toBe(true);
  });

  it("detects HEIC by file extension when the MIME type is missing or generic", () => {
    expect(isHeicFile({ type: "", name: "IMG_1234.HEIC" })).toBe(true);
    expect(isHeicFile({ type: "application/octet-stream", name: "photo.heif" })).toBe(true);
  });

  it("accepts ordinary JPEG and PNG files", () => {
    expect(isHeicFile({ type: "image/jpeg", name: "photo.jpg" })).toBe(false);
    expect(isHeicFile({ type: "image/png", name: "photo.PNG" })).toBe(false);
  });

  it("names the supported formats and the iPhone workaround", () => {
    expect(HEIC_REJECTION_MESSAGE).toContain("JPG or PNG");
    expect(HEIC_REJECTION_MESSAGE).toContain("JPEG");
  });
});
