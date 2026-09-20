// ML model singletons used by the photo editor's compliance checks.
// Both are loaded lazily, once per browser session, on first use.
// Both run on MediaPipe's single-threaded WASM runtime, which works on
// mobile Safari — the previous CLIP/onnxruntime classifier needed
// SharedArrayBuffer (threaded WASM) and failed to load on iOS.
import { FaceLandmarker, FilesetResolver, ImageClassifier } from "@mediapipe/tasks-vision";
import { getMlAssetConfig } from "@/lib/ml-assets";
import { reportModelEvent } from "@/lib/telemetry";

const mlAssets = getMlAssetConfig();

// MediaPipe's WASM runtime logs its own init banner ("INFO: Created TensorFlow
// Lite XNNPACK delegate...") through console.error (fires lazily, on first
// detect() call) — Next's dev overlay mistakes that for a thrown error.
// Filter just that one message, nothing else.
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("INFO:")) return;
    originalError(...args);
  };
}

// ponytail: face-count/presence only — landmarks still place points under
// sunglasses or hats, so eyewear/attire needs a real image classifier, not this.
let landmarkerPromise: Promise<FaceLandmarker> | null = null;
export const getFaceLandmarker = () => {
  if (!landmarkerPromise) {
    const start = performance.now();
    landmarkerPromise = FilesetResolver.forVisionTasks(
      mlAssets.mediapipeWasmPath
    )
      .then((fileset) =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: mlAssets.faceLandmarkerModelPath,
          },
          runningMode: "IMAGE",
          numFaces: 3,
        })
      )
      .then((landmarker) => {
        reportModelEvent("face_landmarker_load", { status: "success", durationMs: performance.now() - start });
        return landmarker;
      })
      .catch((err) => {
        reportModelEvent("face_landmarker_load", { status: "error" });
        landmarkerPromise = null;
        throw err;
      });
  }
  return landmarkerPromise;
};

// Tiny on-device image classifier (EfficientNet-Lite0 int8, ~5MB, ImageNet
// labels) — catches what landmarks can't (sunglasses/eyewear, casual attire).
// Loaded lazily on first upload only; runs fully on-device.
let imageClassifierPromise: Promise<ImageClassifier> | null = null;
export const getImageClassifier = () => {
  if (!imageClassifierPromise) {
    const start = performance.now();
    imageClassifierPromise = FilesetResolver.forVisionTasks(
      mlAssets.mediapipeWasmPath
    )
      .then((fileset) =>
        ImageClassifier.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: mlAssets.imageClassifierModelPath,
          },
          runningMode: "IMAGE",
        })
      )
      .then((classifier) => {
        reportModelEvent("image_classifier_load", { status: "success", durationMs: performance.now() - start });
        return classifier;
      })
      .catch((err) => {
        reportModelEvent("image_classifier_load", { status: "error" });
        imageClassifierPromise = null;
        throw err;
      });
  }
  return imageClassifierPromise;
};

export type PhotoCategory = { categoryName: string; score: number };

// Decision rules for the ImageNet-label classifier, calibrated against the
// SHIPPED model bytes (EfficientNet-Lite0 int8) on real photos — the earlier
// MobileNetV2 prototype numbers did NOT transfer, so these replace them:
//
// Eyewear — combined "sunglass" + "sunglasses" score, 18 photos:
//   9 sunglasses:  0.152, 0.199, 0.234, 0.371, 0.523, 0.625, 0.785, 0.793, 0.812
//   9 clear/bare:  0.000, 0.008, 0.016, 0.027, 0.031, 0.031, 0.043, 0.047, 0.215
// The classes overlap (tinted lenses score low; one clear-glasses close-up
// scored 0.215), so the bar favors recall — missing sunglasses is the failure
// this check exists to prevent, and the warning is dismissible. 0.10 catches
// all 9 sunglasses photos with margin on both sides; only the close-up
// outlier false-positives.
//
// Attire (advisory) — "jersey" is ImageNet's t-shirt label, 9 photos:
//   7 t-shirts: 0.020–0.465; 2 suits: 0.000
// Kept conservative (advisory, not a requirement): flags obvious casual wear
// without nagging. A plain t-shirt at 0.043 slips through — accepted trade-off;
// don't lower this without dress-shirt/blouse/scrubs negatives on hand.
const SUNGLASSES_SCORE_THRESHOLD = 0.1;
const CASUAL_ATTIRE_SCORE_THRESHOLD = 0.08;
const TOP_CATEGORIES_CONSIDERED = 5;

export function detectSunglasses(categories: PhotoCategory[]): boolean {
  const score = categories
    .slice(0, TOP_CATEGORIES_CONSIDERED)
    .filter((category) => category.categoryName.toLowerCase().includes("sunglass"))
    .reduce((sum, category) => sum + category.score, 0);
  return score > SUNGLASSES_SCORE_THRESHOLD;
}

export function detectCasualAttire(categories: PhotoCategory[]): boolean {
  return categories
    .slice(0, TOP_CATEGORIES_CONSIDERED)
    .some(
      (category) =>
        category.categoryName.toLowerCase() === "jersey" &&
        category.score > CASUAL_ATTIRE_SCORE_THRESHOLD
    );
}
