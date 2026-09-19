// Syncs browser ML assets into public/ml so models ship same-origin with the
// app (no CDN fetch at runtime, no cross-origin issues). Idempotent: skips
// files already present with a matching hash.
//
// Why a local copy matters: the face landmarker and image classifier load
// their WASM + model binaries from same-origin paths at runtime. Shipping
// them with the deployment keeps the "photos never leave the browser"
// guarantee and avoids third-party availability as a runtime dependency.
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const publicMlDir = path.join(process.cwd(), "public", "ml");
const manifestPath = path.join(publicMlDir, "manifest.json");

// ---------------------------------------------------------------------------
// Face landmarker (MediaPipe, ~14MB incl. WASM)
// ---------------------------------------------------------------------------
const faceLandmarkerUrl =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const faceLandmarkerPath = path.join(publicMlDir, "mediapipe", "face_landmarker.task");

const mediapipeWasmFiles = [
  "vision_wasm_internal.wasm",
  "vision_wasm_internal.js",
  "vision_wasm_nosimd_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_module_internal.wasm",
  "vision_wasm_module_internal.js",
  "vision_wasm_module_nosimd_internal.wasm",
  "vision_wasm_module_nosimd_internal.js",
];

// ---------------------------------------------------------------------------
// Image classifier (EfficientNet-Lite0 int8, ~5MB, ImageNet labels)
// ---------------------------------------------------------------------------
const imageClassifierUrl =
  "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/int8/1/efficientnet_lite0.tflite";
const imageClassifierPath = path.join(
  publicMlDir,
  "image_classifier",
  "efficientnet_lite0_int8.tflite"
);

// ---------------------------------------------------------------------------
// Removed asset stacks (superseded by the tiny on-device classifier)
// ---------------------------------------------------------------------------
const removedDirs = [
  path.join(publicMlDir, "transformers"), // CLIP model weights + tokenizer
  path.join(publicMlDir, "onnx-wasm"), // onnxruntime threaded WASM
];

const sha256Of = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${url} (${response.status} ${response.statusText})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  // Drop asset stacks the current config no longer references so stale
  // multi-megabyte files can't linger (or get served) after a sync.
  for (const dir of removedDirs) {
    await rm(dir, { recursive: true, force: true });
  }

  await mkdir(path.dirname(faceLandmarkerPath), { recursive: true });
  await mkdir(path.dirname(imageClassifierPath), { recursive: true });

  let existingManifest = { sha256: {} };
  try {
    existingManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    // No manifest yet — everything downloads fresh.
  }

  const manifest = { sha256: {} };

  for (const [url, filePath] of [
    [faceLandmarkerUrl, faceLandmarkerPath],
    [imageClassifierUrl, imageClassifierPath],
  ]) {
    const relativePath = path.relative(publicMlDir, filePath);
    const expectedHash = existingManifest.sha256?.[relativePath];
    let bytes = null;
    if (expectedHash) {
      try {
        const existing = await readFile(filePath);
        if (sha256Of(existing) === expectedHash) {
          bytes = existing;
          console.log(`skipped ${relativePath} (hash matches manifest)`);
        }
      } catch {
        // File missing or unreadable — falls through to download.
      }
    }
    if (!bytes) {
      bytes = await download(url);
      await writeFile(filePath, bytes);
      console.log(`synced ${relativePath} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
    }
    manifest.sha256[relativePath] = sha256Of(bytes);
  }

  // Copy the MediaPipe vision WASM runtime from the installed npm package.
  const visionPackageDir = path.dirname(
    new URL(import.meta.resolve("@mediapipe/tasks-vision")).pathname
  );
  const wasmTargetDir = path.join(publicMlDir, "mediapipe", "wasm");
  await mkdir(wasmTargetDir, { recursive: true });

  for (const file of mediapipeWasmFiles) {
    const sourcePath = path.join(visionPackageDir, "wasm", file);
    const targetPath = path.join(wasmTargetDir, file);
    try {
      const contents = await readFile(sourcePath);
      await writeFile(targetPath, contents);
      manifest.sha256[path.relative(publicMlDir, targetPath)] = sha256Of(contents);
    } catch (error) {
      console.warn(`Skipping ${file}: ${error.message}`);
    }
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("manifest.json written");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
