import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const publicMl = path.join(root, "public", "ml");
const mediapipeWasmSource = path.join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const onnxWasmSource = path.join(root, "node_modules", "onnxruntime-web", "dist");

const huggingFaceRevision = "d15189d7028b43f1d3e65039190477f6af591c2a";
const clipFiles = [
  "config.json",
  "merges.txt",
  "onnx/text_model_quantized.onnx",
  "onnx/vision_model_quantized.onnx",
  // q4f16 variant: kept alongside the default "quantized" (q8) files, not
  // in place of them, so trying it is a one-line dtype change in
  // ml-assets.ts with an easy rollback. Plain "q4" was measured LARGER than
  // q8 for this model's text tower (its block-quantization overhead beats
  // the precision savings here) — q4f16 is the tier that's actually
  // smaller (~126MB vs ~154MB combined), so that's the one worth pulling.
  "onnx/text_model_q4f16.onnx",
  "onnx/vision_model_q4f16.onnx",
  "preprocessor_config.json",
  "special_tokens_map.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "vocab.json",
];
const onnxWasmFiles = [
  "ort-wasm-simd-threaded.asyncify.mjs",
  "ort-wasm-simd-threaded.asyncify.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
];

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

await mkdir(publicMl, { recursive: true });
await rm(path.join(publicMl, "transformers", "Xenova", "clip-vit-base-patch32", "onnx", "model_quantized.onnx"), {
  force: true,
});
await cp(mediapipeWasmSource, path.join(publicMl, "mediapipe", "wasm"), {
  recursive: true,
  force: true,
});

for (const file of onnxWasmFiles) {
  const destination = path.join(publicMl, "onnx-wasm", file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(onnxWasmSource, file), destination, { force: true });
}

await download(
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  path.join(publicMl, "mediapipe", "face_landmarker.task")
);

for (const file of clipFiles) {
  await download(
    `https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/${huggingFaceRevision}/${file}`,
    path.join(publicMl, "transformers", "Xenova", "clip-vit-base-patch32", file)
  );
}

const assetFiles = [
  ...clipFiles.map((file) => path.join("transformers", "Xenova", "clip-vit-base-patch32", file)),
  path.join("mediapipe", "face_landmarker.task"),
  ...onnxWasmFiles.map((file) => path.join("onnx-wasm", file)),
];
const manifest = {};
for (const file of assetFiles) {
  manifest[file] = await sha256(path.join(publicMl, file));
}
await writeFile(
  path.join(publicMl, "manifest.json"),
  `${JSON.stringify({ huggingFaceRevision, sha256: manifest }, null, 2)}\n`
);

console.log(`Synced ${assetFiles.length} pinned ML assets to public/ml.`);
