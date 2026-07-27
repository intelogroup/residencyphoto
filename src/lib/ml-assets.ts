export const getMlAssetConfig = () => ({
  mediapipeWasmPath: "/ml/mediapipe/wasm",
  faceLandmarkerModelPath: "/ml/mediapipe/face_landmarker.task",
  transformersModelPath: "/ml/transformers/",
  transformersWasmPath: "/ml/onnx-wasm/",
  allowRemoteModels: false as const,
  clipModelId: "Xenova/clip-vit-base-patch32",
  clipDtype: "q8" as const,
});
