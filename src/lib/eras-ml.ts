// ML model singletons used by the photo editor's compliance checks.
// Both are loaded lazily, once per browser session, on first use.
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import {
  AutoProcessor,
  AutoTokenizer,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  env,
  RawImage,
} from "@huggingface/transformers";
import { getMlAssetConfig } from "@/lib/ml-assets";
import { reportModelEvent } from "@/lib/telemetry";

const mlAssets = getMlAssetConfig();

env.allowLocalModels = true;
env.allowRemoteModels = mlAssets.allowRemoteModels;
env.localModelPath = mlAssets.transformersModelPath;
if (!env.backends.onnx.wasm) {
  throw new Error("The local ONNX WASM backend is unavailable.");
}
env.backends.onnx.wasm.wasmPaths = mlAssets.transformersWasmPath;

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

// CLIP zero-shot classifier — catches what landmarks can't (sunglasses/eyewear).
// Bigger download (~80-100MB, quantized), loaded lazily on first upload only.
type Classification = { label: string; score: number };
type LocalClipClassifier = (image: string, labels: string[]) => Promise<Classification[]>;

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - max));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function normalizedRows(data: ArrayLike<number>, rows: number, columns: number): number[][] {
  return Array.from({ length: rows }, (_, row) => {
    const values = Array.from({ length: columns }, (_, column) => data[row * columns + column]);
    const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) || 1;
    return values.map((value) => value / norm);
  });
}

function assertEmbeddingShape(
  name: "text" | "image",
  data: ArrayLike<number>,
  rows: number,
  columns: number
) {
  if (
    rows < 1 ||
    columns < 1 ||
    data.length !== rows * columns ||
    Array.from(data).some((value) => !Number.isFinite(value))
  ) {
    throw new Error(`CLIP ${name} embeddings have an unexpected shape.`);
  }
}

let classifierPromise: Promise<LocalClipClassifier> | null = null;
export const getClassifier = () => {
  if (!classifierPromise) {
    const start = performance.now();
    const localOptions = { dtype: mlAssets.clipDtype, local_files_only: true } as const;
    classifierPromise = Promise.all([
      AutoTokenizer.from_pretrained(mlAssets.clipModelId, localOptions),
      AutoProcessor.from_pretrained(mlAssets.clipModelId, localOptions),
      CLIPTextModelWithProjection.from_pretrained(mlAssets.clipModelId, localOptions),
      CLIPVisionModelWithProjection.from_pretrained(mlAssets.clipModelId, localOptions),
    ])
      .then(([tokenizer, processor, textModel, visionModel]) => {
        reportModelEvent("clip_classifier_load", { status: "success", durationMs: performance.now() - start });
        return async (imageSource: string, labels: string[]) => {
          if (labels.length === 0) {
            throw new Error("At least one classification label is required.");
          }
          const texts = labels.map((label) => `This is a photo of ${label}`);
          const textInputs = tokenizer(texts, { padding: true, truncation: true });
          const image = await RawImage.read(imageSource);
          const { pixel_values } = await processor(image);
          const [{ text_embeds }, { image_embeds }] = await Promise.all([
            textModel(textInputs),
            visionModel({ pixel_values }),
          ]);
          const textColumns = text_embeds.dims.at(-1) ?? 0;
          const imageColumns = image_embeds.dims.at(-1) ?? 0;
          assertEmbeddingShape("text", text_embeds.data, labels.length, textColumns);
          assertEmbeddingShape("image", image_embeds.data, 1, imageColumns);
          if (textColumns !== imageColumns) {
            throw new Error("CLIP text and image embedding dimensions do not match.");
          }
          const textRows = normalizedRows(text_embeds.data, labels.length, textColumns);
          const [imageRow] = normalizedRows(image_embeds.data, 1, imageColumns);
          const probabilities = softmax(
            textRows.map((textRow) => 100 * textRow.reduce((sum, value, index) => sum + value * imageRow[index], 0))
          );
          return labels
            .map((label, index) => ({ label, score: probabilities[index] }))
            .sort((a, b) => b.score - a.score);
        };
      })
      .catch((err) => {
        reportModelEvent("clip_classifier_load", { status: "error" });
        classifierPromise = null;
        throw err;
      });
  }
  return classifierPromise;
};
