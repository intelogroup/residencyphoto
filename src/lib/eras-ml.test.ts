import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tokenizerLoad: vi.fn(),
  processorLoad: vi.fn(),
  textModelLoad: vi.fn(),
  visionModelLoad: vi.fn(),
  rawImageRead: vi.fn(),
  filesetLoad: vi.fn(),
  landmarkerLoad: vi.fn(),
  reportModelEvent: vi.fn(),
}));

vi.mock("@huggingface/transformers", () => ({
  env: {
    allowLocalModels: false,
    allowRemoteModels: true,
    localModelPath: "",
    backends: { onnx: { wasm: { wasmPaths: "" } } },
  },
  AutoTokenizer: { from_pretrained: mocks.tokenizerLoad },
  AutoProcessor: { from_pretrained: mocks.processorLoad },
  CLIPTextModelWithProjection: { from_pretrained: mocks.textModelLoad },
  CLIPVisionModelWithProjection: { from_pretrained: mocks.visionModelLoad },
  RawImage: { read: mocks.rawImageRead },
}));

vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: { forVisionTasks: mocks.filesetLoad },
  FaceLandmarker: { createFromOptions: mocks.landmarkerLoad },
}));

vi.mock("./telemetry", () => ({
  reportModelEvent: mocks.reportModelEvent,
}));

describe("browser ML model loading", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("loads the quantized CLIP components locally and reuses them", async () => {
    const tokenizer = vi.fn();
    const processor = vi.fn();
    const textModel = vi.fn();
    const visionModel = vi.fn();
    mocks.tokenizerLoad.mockResolvedValue(tokenizer);
    mocks.processorLoad.mockResolvedValue(processor);
    mocks.textModelLoad.mockResolvedValue(textModel);
    mocks.visionModelLoad.mockResolvedValue(visionModel);

    const { getClassifier } = await import("./eras-ml");
    const { env } = await import("@huggingface/transformers");
    const [first, second] = await Promise.all([getClassifier(), getClassifier()]);

    expect(first).toBe(second);
    expect(env.allowLocalModels).toBe(true);
    expect(env.allowRemoteModels).toBe(false);
    expect(env.localModelPath).toBe("/ml/transformers/");
    expect(env.backends.onnx.wasm).toBeDefined();
    expect(env.backends.onnx.wasm?.wasmPaths).toBe("/ml/onnx-wasm/");
    const expectedOptions = { dtype: "q8", local_files_only: true };
    expect(mocks.tokenizerLoad).toHaveBeenCalledWith("Xenova/clip-vit-base-patch32", expectedOptions);
    expect(mocks.processorLoad).toHaveBeenCalledWith("Xenova/clip-vit-base-patch32", expectedOptions);
    expect(mocks.textModelLoad).toHaveBeenCalledWith("Xenova/clip-vit-base-patch32", expectedOptions);
    expect(mocks.visionModelLoad).toHaveBeenCalledWith("Xenova/clip-vit-base-patch32", expectedOptions);
    expect(mocks.tokenizerLoad).toHaveBeenCalledTimes(1);
    expect(mocks.reportModelEvent).toHaveBeenCalledWith(
      "clip_classifier_load",
      expect.objectContaining({ status: "success" })
    );
  });

  it("rejects an empty classification request before processing the photo", async () => {
    mocks.tokenizerLoad.mockResolvedValue(vi.fn());
    mocks.processorLoad.mockResolvedValue(vi.fn());
    mocks.textModelLoad.mockResolvedValue(vi.fn());
    mocks.visionModelLoad.mockResolvedValue(vi.fn());

    const { getClassifier } = await import("./eras-ml");
    const classify = await getClassifier();

    await expect(classify("blob:private-photo", [])).rejects.toThrow(
      "At least one classification label is required."
    );
    expect(mocks.rawImageRead).not.toHaveBeenCalled();
  });

  it("clears a failed CLIP load so a later attempt can recover", async () => {
    mocks.tokenizerLoad
      .mockRejectedValueOnce(new Error("temporary model fetch failure"))
      .mockResolvedValueOnce(vi.fn());
    mocks.processorLoad.mockResolvedValue(vi.fn());
    mocks.textModelLoad.mockResolvedValue(vi.fn());
    mocks.visionModelLoad.mockResolvedValue(vi.fn());

    const { getClassifier } = await import("./eras-ml");

    await expect(getClassifier()).rejects.toThrow("temporary model fetch failure");
    await expect(getClassifier()).resolves.toBeTypeOf("function");
    expect(mocks.tokenizerLoad).toHaveBeenCalledTimes(2);
    expect(mocks.reportModelEvent).toHaveBeenCalledWith("clip_classifier_load", { status: "error" });
  });

  it("builds CLIP prompts and returns normalized similarity probabilities", async () => {
    const tokenizer = vi.fn().mockReturnValue({ input_ids: "tokens" });
    const processor = vi.fn().mockResolvedValue({ pixel_values: "pixels" });
    const textModel = vi.fn().mockResolvedValue({
      text_embeds: { data: new Float32Array([1, 0, 0, 1]), dims: [2, 2] },
    });
    const visionModel = vi.fn().mockResolvedValue({
      image_embeds: { data: new Float32Array([1, 0]), dims: [1, 2] },
    });
    mocks.tokenizerLoad.mockResolvedValue(tokenizer);
    mocks.processorLoad.mockResolvedValue(processor);
    mocks.textModelLoad.mockResolvedValue(textModel);
    mocks.visionModelLoad.mockResolvedValue(visionModel);
    mocks.rawImageRead.mockResolvedValue({ image: true });

    const { getClassifier } = await import("./eras-ml");
    const classify = await getClassifier();
    const result = await classify("blob:private-photo", ["visible eyes", "dark glasses"]);

    expect(tokenizer).toHaveBeenCalledWith(
      ["This is a photo of visible eyes", "This is a photo of dark glasses"],
      { padding: true, truncation: true }
    );
    expect(mocks.rawImageRead).toHaveBeenCalledWith("blob:private-photo");
    expect(textModel).toHaveBeenCalledWith({ input_ids: "tokens" });
    expect(visionModel).toHaveBeenCalledWith({ pixel_values: "pixels" });
    expect(result[0]).toEqual({ label: "visible eyes", score: expect.closeTo(1, 5) });
    expect(result[1]).toEqual({ label: "dark glasses", score: expect.closeTo(0, 5) });
    expect(result.reduce((sum, item) => sum + item.score, 0)).toBeCloseTo(1);
  });

  it("rejects malformed model embeddings instead of returning NaN scores", async () => {
    mocks.tokenizerLoad.mockResolvedValue(vi.fn().mockReturnValue({}));
    mocks.processorLoad.mockResolvedValue(vi.fn().mockResolvedValue({ pixel_values: "pixels" }));
    mocks.textModelLoad.mockResolvedValue(vi.fn().mockResolvedValue({
      text_embeds: { data: new Float32Array([1, 0]), dims: [2, 2] },
    }));
    mocks.visionModelLoad.mockResolvedValue(vi.fn().mockResolvedValue({
      image_embeds: { data: new Float32Array([1, 0]), dims: [1, 2] },
    }));
    mocks.rawImageRead.mockResolvedValue({ image: true });

    const { getClassifier } = await import("./eras-ml");
    const classify = await getClassifier();

    await expect(classify("blob:private-photo", ["one", "two"])).rejects.toThrow(
      "CLIP text embeddings have an unexpected shape."
    );
  });

  it("loads and reuses the same-origin face landmarker", async () => {
    const fileset = { wasm: true };
    const landmarker = { detect: vi.fn() };
    mocks.filesetLoad.mockResolvedValue(fileset);
    mocks.landmarkerLoad.mockResolvedValue(landmarker);

    const { getFaceLandmarker } = await import("./eras-ml");
    const [first, second] = await Promise.all([getFaceLandmarker(), getFaceLandmarker()]);

    expect(first).toBe(landmarker);
    expect(second).toBe(landmarker);
    expect(mocks.filesetLoad).toHaveBeenCalledWith("/ml/mediapipe/wasm");
    expect(mocks.landmarkerLoad).toHaveBeenCalledWith(fileset, {
      baseOptions: { modelAssetPath: "/ml/mediapipe/face_landmarker.task" },
      runningMode: "IMAGE",
      numFaces: 3,
    });
    expect(mocks.landmarkerLoad).toHaveBeenCalledTimes(1);
  });
});
