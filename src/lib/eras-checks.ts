// Pure, framework-free ERAS compliance logic — extracted from EditorPanel so
// it can run against golden fixtures in tests without WASM/CLIP/canvas.

export const CANVAS_W = 375;
export const CANVAS_H = 525;
// These margins intentionally sit inside the visual guide: landmark 10 is
// the forehead rather than the outer hair silhouette, so allowing it much
// nearer the canvas edge lets the visible top of a head crowd the frame.
export const MIN_TOP_HEAD_MARGIN_PX = 80;
export const MAX_FACE_CENTER_OFFSET_PX = 35;
const FRAMING_EPSILON_PX = 0.001;
// MyERAS states the limit as "150 KB or under" without specifying binary vs
// decimal KB. Using the stricter decimal reading (150,000 bytes, not
// 150*1024=153,600) guarantees we stay under either interpretation.
export const MAX_FILE_BYTES = 150_000;
export const MAX_FILE_KB = MAX_FILE_BYTES / 1000;

export function computeResolutionWarning(naturalWidth: number, naturalHeight: number): string | null {
  if (naturalWidth < CANVAS_W || naturalHeight < CANVAS_H) {
    return "Image resolution is too low — this will look blurry once printed. Use a higher-resolution photo.";
  }
  return null;
}

export function computeRatioWarning(naturalWidth: number, naturalHeight: number): string | null {
  const sourceRatio = naturalWidth / naturalHeight;
  const targetRatio = CANVAS_W / CANVAS_H;
  const deviation = Math.max(sourceRatio / targetRatio, targetRatio / sourceRatio);
  if (deviation > 1.8) {
    return "This photo's shape is very different from ERAS's 2.5x3.5in frame — a lot of it will be cropped away. A photo closer to portrait framing will crop more naturally.";
  }
  return null;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

// AAMC requires a neutral background: white, light gray, or light blue only.
// Brightness/variance alone lets a plain saturated color (red wall, green
// screen) through since it's neither dark nor "busy" by those metrics.
function saturation({ r, g, b }: RGB): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

export function computeBackgroundWarning(topLeftPixels: Uint8ClampedArray, topRightPixels: Uint8ClampedArray): string | null {
  const spots = [topLeftPixels, topRightPixels];
  const brightness: number[] = [];
  const pixels: RGB[] = [];
  for (const data of spots) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      brightness.push((r + g + b) / 3);
      pixels.push({ r, g, b });
    }
  }
  const avg = brightness.reduce((a, b) => a + b, 0) / brightness.length;
  const variance = brightness.reduce((a, b) => a + (b - avg) ** 2, 0) / brightness.length;
  const stdDev = Math.sqrt(variance);
  const avgSaturation = pixels.reduce((a, p) => a + saturation(p), 0) / pixels.length;

  if (avg < 40) {
    return "Background looks very dark — use better lighting or a lighter backdrop.";
  }
  if (stdDev > 60) {
    return "Background looks busy or uneven — use a plain, solid background.";
  }
  // Light blue backgrounds have mild saturation, so the cutoff sits above
  // that (~0.15) and only catches clearly non-neutral colors (reds, greens).
  if (avgSaturation > 0.35) {
    return "Background isn't a neutral color — ERAS requires white, light gray, or light blue.";
  }
  return null;
}

function averageColor(pixelArrays: Uint8ClampedArray[]): RGB {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (const data of pixelArrays) {
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  return { r: r / n, g: g / n, b: b / n };
}

// computeFramingWarning's top-margin check uses landmark 10 (the forehead),
// not the outer hair/head silhouette — so a tall hairstyle or hat can still
// crowd all the way to the canvas edge while the forehead landmark alone
// still reads as having enough margin. This checks the actual pixels instead:
// a strip across the top-center of the frame (where a crowded head would
// show up, not the two corners already used for the background check) that
// no longer resembles the sampled corner background means something (head,
// hair, hat) is touching the top edge with no margin left.
const TOP_EDGE_COLOR_DIFF = 90;

export function computeTopEdgeWarning(
  topCenterStripPixels: Uint8ClampedArray,
  topLeftCornerPixels: Uint8ClampedArray,
  topRightCornerPixels: Uint8ClampedArray,
): string | null {
  const background = averageColor([topLeftCornerPixels, topRightCornerPixels]);
  const center = averageColor([topCenterStripPixels]);
  const diff = Math.abs(center.r - background.r) + Math.abs(center.g - background.g) + Math.abs(center.b - background.b);

  if (diff > TOP_EDGE_COLOR_DIFF) {
    return "No space above your head — zoom out or move the photo down so there's a margin at the top.";
  }
  return null;
}

// Smallest zoom at which a source image of the given dimensions can still
// fully cover the CANVAS_W x CANVAS_H frame (no blank canvas showing through).
export function minCoverZoom(imgWidth: number, imgHeight: number): number {
  return Math.max(CANVAS_W / imgWidth, CANVAS_H / imgHeight);
}

// Keeps the image covering the full frame by bounding how far it can be
// panned: past these limits, an edge of the frame would show blank canvas
// instead of photo. If zoom is below minCoverZoom the image can't cover the
// frame at all regardless of position, so there's nothing sane to clamp to —
// callers should also clamp zoom via minCoverZoom.
export function clampPositionToCover(
  pos: { x: number; y: number },
  zoom: number,
  imgWidth: number,
  imgHeight: number
): { x: number; y: number } {
  const minX = CANVAS_W / 2 / zoom - imgWidth / 2;
  const maxX = imgWidth / 2 - CANVAS_W / 2 / zoom;
  const minY = CANVAS_H / 2 / zoom - imgHeight / 2;
  const maxY = imgHeight / 2 - CANVAS_H / 2 / zoom;
  return {
    x: maxX >= minX ? Math.min(Math.max(pos.x, minX), maxX) : 0,
    y: maxY >= minY ? Math.min(Math.max(pos.y, minY), maxY) : 0,
  };
}

export interface FaceLandmarkPoint {
  x: number;
  y: number;
}

export type FaceCountResult =
  | { kind: "none" }
  | { kind: "multiple" }
  | { kind: "one"; landmarks: FaceLandmarkPoint[] };

export function computeFramingWarning(face: FaceCountResult): string | null {
  if (face.kind === "none") {
    return "Face isn't fully visible in the frame — zoom out or reposition the photo.";
  }
  if (face.kind === "multiple") {
    return null;
  }

  const landmarks = face.landmarks;
  const topY = landmarks[10].y * CANVAS_H;
  const chinY = landmarks[152].y * CANVAS_H;
  const noseX = landmarks[1].x * CANVAS_W;
  const headHeightPx = chinY - topY;
  const warnings: string[] = [];

  if (topY <= MIN_TOP_HEAD_MARGIN_PX + FRAMING_EPSILON_PX) {
    warnings.push("Head is too close to the top of the frame — move the photo down.");
  }
  if (chinY > 490) warnings.push("Head is too close to the bottom of the frame — move the photo up.");
  if (Math.abs(noseX - CANVAS_W / 2) > MAX_FACE_CENTER_OFFSET_PX + FRAMING_EPSILON_PX) {
    warnings.push("Face isn't centered — reposition the photo horizontally.");
  }
  if (headHeightPx > 300) warnings.push("Face is too close — zoom out so your head fits the guide.");
  if (headHeightPx < 150) warnings.push("Face is too small — zoom in so your head fills the guide.");
  return warnings.length > 0 ? warnings.join(" ") : null;
}

export function computePoseWarning(face: FaceCountResult): string | null {
  if (face.kind !== "one") return null;
  const landmarks = face.landmarks;
  const noseX = landmarks[1].x * CANVAS_W;
  const leftCheekX = landmarks[234].x * CANVAS_W;
  const rightCheekX = landmarks[454].x * CANVAS_W;
  const leftDist = Math.abs(noseX - leftCheekX);
  const rightDist = Math.abs(rightCheekX - noseX);
  const asymmetry = (rightDist - leftDist) / (rightDist + leftDist);

  if (Math.abs(asymmetry) > 0.2) {
    return "Face isn't facing forward — turn to look directly at the camera.";
  }
  return null;
}

export interface CompressionResult {
  quality: number;
  sizeBytes: number;
  exceedsLimit: boolean;
}

// estimateSize(quality) must be a pure/deterministic size estimator (real
// caller wraps canvas.toDataURL); kept as an injected fn so this loop is
// testable without a canvas.
export function compressToTarget(estimateSize: (quality: number) => number, targetBytes = MAX_FILE_BYTES): CompressionResult {
  let quality = 0.95;
  let sizeBytes = estimateSize(quality);

  while (sizeBytes >= targetBytes && quality > 0.1) {
    quality -= 0.05;
    sizeBytes = estimateSize(quality);
  }

  return { quality, sizeBytes, exceedsLimit: sizeBytes >= targetBytes };
}

// Patches the JFIF APP0 density fields on a canvas-exported JPEG data URL so
// the file reports 150dpi instead of the browser's default 72dpi/undefined.
// Assumes APP0 immediately follows SOI (bytes 2-3 == FFE0), true for
// canvas.toDataURL output but not a universal JPEG guarantee — callers should
// treat a false return as "DPI tag not written" rather than throw.
export function setJpegDpi(dataUrl: string, dpi: number): { dataUrl: string; patched: boolean } {
  const [prefix, base64] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  if (bytes[2] !== 0xff || bytes[3] !== 0xe0) {
    return { dataUrl, patched: false };
  }

  bytes[13] = 1;
  bytes[14] = (dpi >> 8) & 0xff;
  bytes[15] = dpi & 0xff;
  bytes[16] = (dpi >> 8) & 0xff;
  bytes[17] = dpi & 0xff;

  let out = "";
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return { dataUrl: `${prefix},${btoa(out)}`, patched: true };
}
