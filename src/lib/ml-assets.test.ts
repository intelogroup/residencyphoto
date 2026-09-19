import { describe, expect, it } from "vitest";
import { getMlAssetConfig } from "./ml-assets";

describe("getMlAssetConfig", () => {
  it("uses same-origin paths for the MediaPipe landmarker and image classifier", () => {
    expect(getMlAssetConfig()).toEqual({
      mediapipeWasmPath: "/ml/mediapipe/wasm",
      faceLandmarkerModelPath: "/ml/mediapipe/face_landmarker.task",
      imageClassifierModelPath: "/ml/image_classifier/efficientnet_lite0_int8.tflite",
    });
  });
});
