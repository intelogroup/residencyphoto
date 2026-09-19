import { describe, it, expect } from "vitest";
import {
  computeResolutionWarning,
  computeRatioWarning,
  computeBackgroundWarning,
  computeTopEdgeWarning,
  computeFramingWarning,
  computePoseWarning,
  compressToTarget,
  setJpegDpi,
  MAX_FILE_BYTES,
  type FaceCountResult,
  type FaceLandmarkPoint,
} from "./eras-checks";

// ---- Golden fixtures -------------------------------------------------
// Landmark indices used by the app: 10 = forehead top, 152 = chin,
// 1 = nose tip, 234 = left cheek, 454 = right cheek. Coordinates are
// normalized [0,1] fractions of the 375x525 canvas, matching MediaPipe
// FaceLandmarker output.
function makeLandmarks(overrides: Partial<Record<10 | 152 | 1 | 234 | 454, FaceLandmarkPoint>>) {
  const base: FaceLandmarkPoint[] = new Array(468).fill({ x: 0.5, y: 0.5 });
  const arr = base.slice();
  Object.entries(overrides).forEach(([idx, pt]) => {
    arr[Number(idx)] = pt;
  });
  return arr;
}

// A well-centered, correctly-sized, frontal face: top y=100/525, chin
// y=340/525 (height 240px, within the 150-300 band), nose centered at
// x=187.5/375, symmetric cheeks.
const GOLDEN_GOOD_FACE: FaceLandmarkPoint[] = makeLandmarks({
  10: { x: 0.5, y: 100 / 525 },
  152: { x: 0.5, y: 340 / 525 },
  1: { x: 0.5, y: 0.4 },
  234: { x: (187.5 - 60) / 375, y: 0.5 },
  454: { x: (187.5 + 60) / 375, y: 0.5 },
});

function oneFace(landmarks: FaceLandmarkPoint[]): FaceCountResult {
  return { kind: "one", landmarks };
}

describe("computeResolutionWarning", () => {
  it("passes an image exactly at the export size", () => {
    expect(computeResolutionWarning(375, 525)).toBeNull();
  });
  it("passes a high-res source", () => {
    expect(computeResolutionWarning(1200, 1600)).toBeNull();
  });
  it("flags a source narrower than the export width", () => {
    expect(computeResolutionWarning(300, 600)).not.toBeNull();
  });
  it("flags a source shorter than the export height", () => {
    expect(computeResolutionWarning(500, 400)).not.toBeNull();
  });
  it("flags a source one pixel short on width", () => {
    expect(computeResolutionWarning(374, 600)).not.toBeNull();
  });
  it("flags a source one pixel short on height", () => {
    expect(computeResolutionWarning(600, 524)).not.toBeNull();
  });
  it("flags a tiny thumbnail-sized source", () => {
    expect(computeResolutionWarning(64, 64)).not.toBeNull();
  });
});

describe("computeRatioWarning", () => {
  it("passes a photo already shaped like the 5:7 frame", () => {
    expect(computeRatioWarning(750, 1050)).toBeNull();
  });
  it("passes a portrait phone photo (3:4)", () => {
    expect(computeRatioWarning(1200, 1600)).toBeNull();
  });
  it("flags a wide landscape/group photo", () => {
    expect(computeRatioWarning(1600, 900)).not.toBeNull();
  });
  it("flags a square profile photo at the edge (documented threshold)", () => {
    // 1:1 vs 5:7 deviation is exactly 1.4 — under the 1.8 cutoff, so this
    // is a known gap: square photos crop hard but aren't flagged.
    expect(computeRatioWarning(600, 600)).toBeNull();
  });
  it("passes right at the 1.8 deviation boundary (not strictly greater)", () => {
    // targetRatio = 375/525 = 5/7. sourceRatio = 5/7 * 1.8 = 9/7 exactly,
    // via integer width/height so there's no floating-point rounding.
    expect(computeRatioWarning(900, 700)).toBeNull();
  });
  it("flags a wide panorama shot", () => {
    expect(computeRatioWarning(3000, 800)).not.toBeNull();
  });
  it("flags an extreme full-body vertical crop (very tall/narrow)", () => {
    expect(computeRatioWarning(300, 3000)).not.toBeNull();
  });
});

describe("computeBackgroundWarning", () => {
  const solid = (r: number, g: number, b: number, n = 900) => {
    const data = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) {
      data[i * 4] = r;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = b;
      data[i * 4 + 3] = 255;
    }
    return data;
  };

  it("passes a white studio background", () => {
    expect(computeBackgroundWarning(solid(250, 250, 250), solid(250, 250, 250))).toBeNull();
  });
  it("passes a light gray background", () => {
    expect(computeBackgroundWarning(solid(200, 200, 200), solid(200, 200, 200))).toBeNull();
  });
  it("passes a real-world gray backdrop (avg~63/stdDev source)", () => {
    expect(computeBackgroundWarning(solid(63, 63, 63), solid(63, 63, 63))).toBeNull();
  });
  it("passes a light blue background", () => {
    expect(computeBackgroundWarning(solid(210, 225, 240), solid(210, 225, 240))).toBeNull();
  });
  it("flags a near-black/unlit background", () => {
    expect(computeBackgroundWarning(solid(10, 10, 10), solid(10, 10, 10))).not.toBeNull();
  });
  it("flags a saturated red background (neutral-color rule)", () => {
    expect(computeBackgroundWarning(solid(200, 30, 30), solid(200, 30, 30))).not.toBeNull();
  });
  it("flags a saturated green-screen background", () => {
    expect(computeBackgroundWarning(solid(20, 200, 40), solid(20, 200, 40))).not.toBeNull();
  });
  it("flags an uneven/patterned background", () => {
    const patterned = new Uint8ClampedArray(900 * 4);
    for (let i = 0; i < 900; i++) {
      const v = i % 2 === 0 ? 20 : 240;
      patterned[i * 4] = v;
      patterned[i * 4 + 1] = v;
      patterned[i * 4 + 2] = v;
      patterned[i * 4 + 3] = 255;
    }
    expect(computeBackgroundWarning(patterned, patterned)).not.toBeNull();
  });
  it("passes brightness exactly at the dark-cutoff boundary (40, not <40)", () => {
    expect(computeBackgroundWarning(solid(40, 40, 40), solid(40, 40, 40))).toBeNull();
  });
  it("flags brightness just under the dark cutoff", () => {
    expect(computeBackgroundWarning(solid(39, 39, 39), solid(39, 39, 39))).not.toBeNull();
  });
  it("flags a background split between two shoulders framing it asymmetrically (one corner clean, one corner dark hair)", () => {
    // Left corner clean white background, right corner mostly dark hair/hat
    // bleeding into frame — should read as uneven, not just "a bit dark".
    expect(computeBackgroundWarning(solid(245, 245, 245), solid(15, 15, 15))).not.toBeNull();
  });
  it("passes a plain background with dark shoulder/collar fabric only in the very corner pixels absent (top corners are pure backdrop)", () => {
    // Sanity: uniform light-gray in both sampled top corners passes even
    // though a real photo would have dark clothing lower in frame — the
    // function only ever sees what's handed to it (top corners).
    expect(computeBackgroundWarning(solid(220, 220, 225), solid(220, 220, 225))).toBeNull();
  });
  it("flags a mid-saturation background just over the neutral-color cutoff", () => {
    // r=200,g=140,b=140 → saturation = (200-140)/200 = 0.30, under 0.35, passes
    expect(computeBackgroundWarning(solid(200, 140, 140), solid(200, 140, 140))).toBeNull();
    // r=200,g=120,b=120 → saturation = (200-120)/200 = 0.40, over 0.35, flags
    expect(computeBackgroundWarning(solid(200, 120, 120), solid(200, 120, 120))).not.toBeNull();
  });
  it("prioritizes the dark warning over the saturation warning when both apply", () => {
    // A dark saturated red (avg well under 40) should read as "too dark",
    // not a confusing color-neutrality message.
    const result = computeBackgroundWarning(solid(30, 5, 5), solid(30, 5, 5));
    expect(result).toMatch(/dark/i);
  });
});

describe("computeTopEdgeWarning", () => {
  const solid = (r: number, g: number, b: number, n = 900) => {
    const data = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) {
      data[i * 4] = r;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = b;
      data[i * 4 + 3] = 255;
    }
    return data;
  };
  const background = solid(230, 230, 230);

  it("passes when the top-center strip matches the sampled background", () => {
    expect(computeTopEdgeWarning(solid(230, 230, 230), background, background)).toBeNull();
  });
  it("passes minor JPEG-noise variation from the background", () => {
    expect(computeTopEdgeWarning(solid(225, 232, 228), background, background)).toBeNull();
  });
  it("flags dark hair crowding the top edge with no margin left", () => {
    expect(computeTopEdgeWarning(solid(30, 25, 20), background, background)).toMatch(/no space above/i);
  });
  it("flags skin tone touching the top edge", () => {
    expect(computeTopEdgeWarning(solid(200, 150, 120), background, background)).toMatch(/no space above/i);
  });
  it("still compares against the background even when the two corners disagree slightly", () => {
    const topLeft = solid(235, 235, 235);
    const topRight = solid(225, 225, 225);
    expect(computeTopEdgeWarning(solid(230, 230, 230), topLeft, topRight)).toBeNull();
  });
});

describe("computeFramingWarning", () => {
  it("passes a well-centered, correctly-sized face", () => {
    expect(computeFramingWarning(oneFace(GOLDEN_GOOD_FACE))).toBeNull();
  });
  it("flags no face in the cropped frame", () => {
    expect(computeFramingWarning({ kind: "none" })).not.toBeNull();
  });
  it("does not flag multiple faces as a framing issue (separate concern)", () => {
    expect(computeFramingWarning({ kind: "multiple" })).toBeNull();
  });
  it("flags a face that's too close (zoomed in too far)", () => {
    const tooClose = makeLandmarks({
      10: { x: 0.5, y: 50 / 525 },
      152: { x: 0.5, y: 400 / 525 }, // height 350 > 300
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.4, y: 0.5 },
      454: { x: 0.6, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(tooClose))).toMatch(/too close/i);
  });
  it("flags a face that's too small (zoomed out too far)", () => {
    const tooSmall = makeLandmarks({
      10: { x: 0.5, y: 200 / 525 },
      152: { x: 0.5, y: 320 / 525 }, // height 120 < 150
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.45, y: 0.5 },
      454: { x: 0.55, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(tooSmall))).toMatch(/too small/i);
  });
  it("flags a head cropped off the top edge", () => {
    const cutOff = makeLandmarks({
      10: { x: 0.5, y: 20 / 525 }, // < 40
      152: { x: 0.5, y: 260 / 525 },
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.4, y: 0.5 },
      454: { x: 0.6, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(cutOff))).toMatch(/top/i);
  });
  it("flags a head that is too close to the top guide", () => {
    const topTight = makeLandmarks({
      10: { x: 0.5, y: 80 / 525 },
      152: { x: 0.5, y: 340 / 525 },
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.4, y: 0.5 },
      454: { x: 0.6, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(topTight))).toMatch(/top/i);
  });
  it("includes centering guidance when a top-tight head is also off-center", () => {
    const topTightAndOffCenter = makeLandmarks({
      10: { x: 0.5, y: 80 / 525 },
      152: { x: 0.5, y: 340 / 525 },
      1: { x: (187.5 + 50) / 375, y: 0.4 },
      234: { x: 0.55, y: 0.5 },
      454: { x: 0.7, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(topTightAndOffCenter))).toMatch(/top.*centered/i);
  });
  it("flags an off-center face", () => {
    const offCenter = makeLandmarks({
      10: { x: 0.2, y: 100 / 525 },
      152: { x: 0.2, y: 340 / 525 },
      1: { x: (187.5 + 100) / 375, y: 0.4 }, // 100px right of center, > 55 threshold
      234: { x: 0.6, y: 0.5 },
      454: { x: 0.75, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(offCenter))).toMatch(/centered/i);
  });
  it("flags a face 50px off the horizontal center", () => {
    const slightlyOffCenter = makeLandmarks({
      10: { x: 0.5, y: 100 / 525 },
      152: { x: 0.5, y: 340 / 525 },
      1: { x: (187.5 + 50) / 375, y: 0.4 },
      234: { x: 0.55, y: 0.5 },
      454: { x: 0.7, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(slightlyOffCenter))).toMatch(/centered/i);
  });
  it("passes a 300px head height just below the top-margin cutoff", () => {
    const atBoundary = makeLandmarks({
      10: { x: 0.5, y: 81 / 525 },
      152: { x: 0.5, y: 381 / 525 }, // height exactly 300
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.4, y: 0.5 },
      454: { x: 0.6, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(atBoundary))).toBeNull();
  });
  it("passes head height exactly at the 150px boundary (not strictly less)", () => {
    const atBoundary = makeLandmarks({
      10: { x: 0.5, y: 190 / 525 },
      152: { x: 0.5, y: 340 / 525 }, // height exactly 150
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.45, y: 0.5 },
      454: { x: 0.55, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(atBoundary))).toBeNull();
  });
  it("passes noseX exactly at the 35px centering boundary", () => {
    const atBoundary = makeLandmarks({
      10: { x: 0.5, y: 100 / 525 },
      152: { x: 0.5, y: 340 / 525 },
      1: { x: (187.5 + 35) / 375, y: 0.4 }, // exactly 35px off-center
      234: { x: 0.5, y: 0.5 },
      454: { x: 0.75, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(atBoundary))).toBeNull();
  });
  it("flags a head cropped off the bottom edge", () => {
    const cutOff = makeLandmarks({
      10: { x: 0.5, y: 240 / 525 },
      152: { x: 0.5, y: 495 / 525 }, // > 490
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.4, y: 0.5 },
      454: { x: 0.6, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(cutOff))).toMatch(/bottom/i);
  });
  it("flags a face pushed off-center to the left", () => {
    const offLeft = makeLandmarks({
      10: { x: 0.2, y: 100 / 525 },
      152: { x: 0.2, y: 340 / 525 },
      1: { x: (187.5 - 100) / 375, y: 0.4 }, // 100px left of center
      234: { x: 0.05, y: 0.5 },
      454: { x: 0.2, y: 0.5 },
    });
    expect(computeFramingWarning(oneFace(offLeft))).toMatch(/centered/i);
  });
});

describe("computePoseWarning", () => {
  it("passes a frontal, symmetric face", () => {
    expect(computePoseWarning(oneFace(GOLDEN_GOOD_FACE))).toBeNull();
  });
  it("flags a head turned to the side", () => {
    const turned = makeLandmarks({
      1: { x: 0.5, y: 0.4 },
      234: { x: 0.48, y: 0.5 }, // left cheek very close to nose
      454: { x: 0.9, y: 0.5 }, // right cheek far away — turned away from camera
    });
    expect(computePoseWarning(oneFace(turned))).not.toBeNull();
  });
  it("is silent when there's no single face (framing owns that message)", () => {
    expect(computePoseWarning({ kind: "none" })).toBeNull();
    expect(computePoseWarning({ kind: "multiple" })).toBeNull();
  });
  it("passes asymmetry exactly at the 0.2 boundary (not strictly greater)", () => {
    // leftDist=40, rightDist=60 -> asymmetry = (60-40)/(60+40) = 0.2 exactly
    const atBoundary = makeLandmarks({
      1: { x: 187.5 / 375, y: 0.4 },
      234: { x: (187.5 - 40) / 375, y: 0.5 },
      454: { x: (187.5 + 60) / 375, y: 0.5 },
    });
    expect(computePoseWarning(oneFace(atBoundary))).toBeNull();
  });
  it("flags a near-full-profile turn (one cheek landmark far past the other)", () => {
    const profile = makeLandmarks({
      1: { x: 187.5 / 375, y: 0.4 },
      234: { x: (187.5 - 5) / 375, y: 0.5 },
      454: { x: (187.5 + 150) / 375, y: 0.5 },
    });
    expect(computePoseWarning(oneFace(profile))).not.toBeNull();
  });
  it("flags a turn to the opposite side symmetrically", () => {
    const turnedLeft = makeLandmarks({
      1: { x: 187.5 / 375, y: 0.4 },
      234: { x: (187.5 - 150) / 375, y: 0.5 },
      454: { x: (187.5 + 5) / 375, y: 0.5 },
    });
    expect(computePoseWarning(oneFace(turnedLeft))).not.toBeNull();
  });
});

describe("compressToTarget", () => {
  it("stops as soon as a quality step drops under the 150KB limit", () => {
    // Linear stand-in: size shrinks with quality, crosses the limit at q=0.7
    const estimate = (q: number) => Math.round(q * 200 * 1024);
    const result = compressToTarget(estimate);
    expect(result.exceedsLimit).toBe(false);
    expect(result.sizeBytes).toBeLessThan(MAX_FILE_BYTES);
  });
  it("flags exceedsLimit when even minimum quality can't hit the target", () => {
    const estimate = () => 300 * 1024; // never shrinks below 300KB
    const result = compressToTarget(estimate);
    expect(result.exceedsLimit).toBe(true);
    expect(result.quality).toBeCloseTo(0.1, 5);
  });
  it("keeps quality at 0.95 when the first pass already fits", () => {
    const estimate = () => 50 * 1024;
    const result = compressToTarget(estimate);
    expect(result.quality).toBe(0.95);
    expect(result.exceedsLimit).toBe(false);
  });
  it("treats a size exactly at the 150KB limit as still exceeding (loop uses >=)", () => {
    const estimate = () => MAX_FILE_BYTES;
    const result = compressToTarget(estimate);
    // Loop condition is `sizeBytes >= targetBytes`, so an exact match keeps
    // compressing down to the quality floor rather than accepting it.
    expect(result.exceedsLimit).toBe(true);
  });
  it("stops exactly one step under the limit, not further than necessary", () => {
    // Size drops in fixed 10KB steps per 0.05 quality decrement, crossing
    // under 150KB at a known quality — verifies the loop doesn't overshoot.
    const steps: Record<number, number> = {};
    let q = 0.95;
    let kb = 200;
    while (q > 0.05) {
      steps[Math.round(q * 100)] = kb * 1024;
      q = Math.round((q - 0.05) * 100) / 100;
      kb -= 10;
    }
    const estimate = (quality: number) => steps[Math.round(quality * 100)] ?? 0;
    const result = compressToTarget(estimate);
    expect(result.sizeBytes).toBeLessThan(MAX_FILE_BYTES);
    expect(result.sizeBytes).toBeGreaterThanOrEqual(MAX_FILE_BYTES - 10 * 1024);
  });
  it("respects a custom target size", () => {
    const estimate = (q: number) => Math.round(q * 100 * 1024);
    const result = compressToTarget(estimate, 50 * 1024);
    expect(result.sizeBytes).toBeLessThan(50 * 1024);
  });
});

describe("setJpegDpi", () => {
  // Minimal synthetic JPEG: SOI (FFD8) + APP0 (FFE0) + length + "JFIF\0" +
  // version(2) + units(1) + xdensity(2) + ydensity(2) + thumb w/h(2).
  function makeFakeJpeg(): string {
    const bytes = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe0, // APP0
      0x00, 0x10, // length = 16
      0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
      0x01, 0x01, // version
      0x00, // units = 0 (no units)
      0x00, 0x48, // xdensity = 72
      0x00, 0x48, // ydensity = 72
      0x00, 0x00, // thumbnail w/h
    ]);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return `data:image/jpeg;base64,${btoa(bin)}`;
  }

  it("patches density fields on a well-formed JFIF header", () => {
    const { dataUrl, patched } = setJpegDpi(makeFakeJpeg(), 150);
    expect(patched).toBe(true);

    const base64 = dataUrl.split(",")[1];
    const bin = atob(base64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    expect(bytes[13]).toBe(1); // units = dpi
    expect((bytes[14] << 8) | bytes[15]).toBe(150);
    expect((bytes[16] << 8) | bytes[17]).toBe(150);
  });

  it("does not patch (and does not throw) on a non-JFIF header", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x01]);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const url = `data:image/jpeg;base64,${btoa(bin)}`;
    const { patched, dataUrl } = setJpegDpi(url, 150);
    expect(patched).toBe(false);
    expect(dataUrl).toBe(url);
  });
  it("does not throw on a truncated/corrupt byte stream shorter than the density fields", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const url = `data:image/jpeg;base64,${btoa(bin)}`;
    expect(() => setJpegDpi(url, 150)).not.toThrow();
  });
  it("encodes a two-byte dpi value correctly (300, not just single-byte values)", () => {
    const { dataUrl } = setJpegDpi(makeFakeJpeg(), 300);
    const base64 = dataUrl.split(",")[1];
    const bin = atob(base64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    expect((bytes[14] << 8) | bytes[15]).toBe(300);
    expect((bytes[16] << 8) | bytes[17]).toBe(300);
  });
  it("round-trips through the base64 encode/decode without corrupting unrelated bytes", () => {
    const original = makeFakeJpeg();
    const { dataUrl } = setJpegDpi(original, 150);
    const originalBytes = Uint8Array.from(atob(original.split(",")[1]), (c) => c.charCodeAt(0));
    const patchedBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
    expect(patchedBytes.length).toBe(originalBytes.length);
    // Only bytes 13-17 (units + x/y density) should differ.
    for (let i = 0; i < originalBytes.length; i++) {
      if (i >= 13 && i <= 17) continue;
      expect(patchedBytes[i]).toBe(originalBytes[i]);
    }
  });
});
