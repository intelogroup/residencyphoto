import { describe, expect, it } from "vitest";
import { getMlAssetConfig } from "./ml-assets";

describe("getMlAssetConfig", () => {
  it("uses same-origin paths and disables remote model fallback", () => {
    expect(getMlAssetConfig()).toEqual({
      mediapipeWasmPath: "/ml/mediapipe/wasm",
      faceLandmarkerModelPath: "/ml/mediapipe/face_landmarker.task",
      transformersModelPath: "/ml/transformers/",
      transformersWasmPath: "/ml/onnx-wasm/",
      allowRemoteModels: false,
      clipModelId: "Xenova/clip-vit-base-patch32",
      clipDtype: "q8",
    });
  });
});
