import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type MlManifest = {
  sha256: Record<string, string>;
};

const publicMl = path.join(process.cwd(), "public", "ml");

async function readManifest(): Promise<MlManifest> {
  return JSON.parse(await readFile(path.join(publicMl, "manifest.json"), "utf8")) as MlManifest;
}

describe("bundled browser ML assets", () => {
  it("includes every required runtime/model file", async () => {
    const manifest = await readManifest();

    expect(Object.keys(manifest.sha256)).toEqual(expect.arrayContaining([
      "mediapipe/face_landmarker.task",
      "mediapipe/wasm/vision_wasm_internal.wasm",
      "image_classifier/efficientnet_lite0_int8.tflite",
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

  it("no longer ships the removed CLIP/onnxruntime asset stacks", async () => {
    const manifest = await readManifest();
    const keys = Object.keys(manifest.sha256);

    expect(keys.some((key) => key.startsWith("transformers/"))).toBe(false);
    expect(keys.some((key) => key.startsWith("onnx-wasm/"))).toBe(false);
  });
});
