import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type MlManifest = {
  huggingFaceRevision: string;
  sha256: Record<string, string>;
};

const publicMl = path.join(process.cwd(), "public", "ml");

async function readManifest(): Promise<MlManifest> {
  return JSON.parse(await readFile(path.join(publicMl, "manifest.json"), "utf8")) as MlManifest;
}

describe("bundled browser ML assets", () => {
  it("pins a Hugging Face revision and includes every required runtime/model file", async () => {
    const manifest = await readManifest();

    expect(manifest.huggingFaceRevision).toMatch(/^[a-f0-9]{40}$/);
    expect(Object.keys(manifest.sha256)).toEqual(expect.arrayContaining([
      "transformers/Xenova/clip-vit-base-patch32/config.json",
      "transformers/Xenova/clip-vit-base-patch32/tokenizer.json",
      "transformers/Xenova/clip-vit-base-patch32/onnx/text_model_quantized.onnx",
      "transformers/Xenova/clip-vit-base-patch32/onnx/vision_model_quantized.onnx",
      "mediapipe/face_landmarker.task",
      "onnx-wasm/ort-wasm-simd-threaded.mjs",
      "onnx-wasm/ort-wasm-simd-threaded.wasm",
    ]));

    for (const relativePath of Object.keys(manifest.sha256)) {
      expect((await stat(path.join(publicMl, relativePath))).size).toBeGreaterThan(0);
    }
  });

  it("matches the integrity hashes produced by the asset sync script", async () => {
    const manifest = await readManifest();

    for (const [relativePath, expectedHash] of Object.entries(manifest.sha256)) {
      const contents = await readFile(path.join(publicMl, relativePath));
      const actualHash = createHash("sha256").update(contents).digest("hex");
      expect(actualHash, relativePath).toBe(expectedHash);
    }
  });
});
