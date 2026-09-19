import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  filesetLoad: vi.fn(),
  landmarkerLoad: vi.fn(),
  imageClassifierLoad: vi.fn(),
  reportModelEvent: vi.fn(),
}));

vi.mock("@mediapipe/tasks-vision", () => ({
  FilesetResolver: { forVisionTasks: mocks.filesetLoad },
  FaceLandmarker: { createFromOptions: mocks.landmarkerLoad },
  ImageClassifier: { createFromOptions: mocks.imageClassifierLoad },
}));

vi.mock("./telemetry", () => ({
  reportModelEvent: mocks.reportModelEvent,
}));

describe("browser ML model loading", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("loads the tiny on-device image classifier and reuses it", async () => {
    const fileset = { wasm: true };
    const classifier = { classify: vi.fn() };
    mocks.filesetLoad.mockResolvedValue(fileset);
    mocks.imageClassifierLoad.mockResolvedValue(classifier);

    const { getImageClassifier } = await import("./eras-ml");
    const [first, second] = await Promise.all([getImageClassifier(), getImageClassifier()]);

    expect(first).toBe(classifier);
    expect(second).toBe(classifier);
    expect(mocks.filesetLoad).toHaveBeenCalledWith("/ml/mediapipe/wasm");
    expect(mocks.imageClassifierLoad).toHaveBeenCalledWith(fileset, {
      baseOptions: { modelAssetPath: "/ml/image_classifier/efficientnet_lite0_int8.tflite" },
      runningMode: "IMAGE",
    });
    expect(mocks.imageClassifierLoad).toHaveBeenCalledTimes(1);
    expect(mocks.reportModelEvent).toHaveBeenCalledWith(
      "image_classifier_load",
      expect.objectContaining({ status: "success" })
    );
  });

  it("clears a failed image classifier load so a later attempt can recover", async () => {
    const fileset = { wasm: true };
    mocks.filesetLoad.mockResolvedValue(fileset);
    mocks.imageClassifierLoad
      .mockRejectedValueOnce(new Error("temporary model fetch failure"))
      .mockResolvedValueOnce({ classify: vi.fn() });

    const { getImageClassifier } = await import("./eras-ml");

    await expect(getImageClassifier()).rejects.toThrow("temporary model fetch failure");
    await expect(getImageClassifier()).resolves.toBeTypeOf("object");
    expect(mocks.imageClassifierLoad).toHaveBeenCalledTimes(2);
    expect(mocks.reportModelEvent).toHaveBeenCalledWith("image_classifier_load", { status: "error" });
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

describe("photo classification rules", () => {
  // Category scores below mirror the measured prototype runs so the
  // thresholds are pinned to real model behavior, not guesses.

  it("flags sunglasses photos and not clear prescription glasses", async () => {
    const { detectSunglasses } = await import("./eras-ml");

    // Measured: sunglasses photos scored 0.88–0.98 combined on these two classes.
    expect(
      detectSunglasses([
        { categoryName: "sunglass", score: 0.617 },
        { categoryName: "sunglasses", score: 0.325 },
        { categoryName: "trench coat", score: 0.006 },
      ])
    ).toBe(true);

    // Measured: clear-glasses photos scored at most 0.08 combined — and only
    // when ranked 3rd/4th, never the top prediction.
    expect(
      detectSunglasses([
        { categoryName: "lab coat", score: 0.169 },
        { categoryName: "volleyball", score: 0.105 },
        { categoryName: "sunglass", score: 0.055 },
        { categoryName: "sunglasses", score: 0.029 },
      ])
    ).toBe(false);

    // Bare-eyed photo: no sunglasses classes in the top predictions at all.
    expect(
      detectSunglasses([
        { categoryName: "cardigan", score: 0.118 },
        { categoryName: "sweatshirt", score: 0.073 },
      ])
    ).toBe(false);
  });

  it("ignores sunglasses labels ranked below the top predictions", async () => {
    const { detectSunglasses } = await import("./eras-ml");

    expect(
      detectSunglasses([
        { categoryName: "suit", score: 0.85 },
        { categoryName: "jean", score: 0.124 },
        { categoryName: "bow tie", score: 0.004 },
        { categoryName: "trench coat", score: 0.003 },
        { categoryName: "groom", score: 0.002 },
        { categoryName: "sunglass", score: 0.001 },
      ])
    ).toBe(false);
  });

  it("flags obvious casual attire (t-shirt) without nagging about the rest", async () => {
    const { detectCasualAttire } = await import("./eras-ml");

    // Measured: the t-shirt photo scored 0.11 on "jersey" (ImageNet's t-shirt class).
    expect(
      detectCasualAttire([
        { categoryName: "miniskirt", score: 0.209 },
        { categoryName: "jean", score: 0.11 },
        { categoryName: "jersey", score: 0.11 },
      ])
    ).toBe(true);

    // Measured: a casually-dressed bare-eyed photo scored only 0.045 on "jersey".
    expect(
      detectCasualAttire([
        { categoryName: "cardigan", score: 0.118 },
        { categoryName: "sweatshirt", score: 0.073 },
        { categoryName: "jersey", score: 0.045 },
      ])
    ).toBe(false);

    // Suit photo: formal wear, no casual signal.
    expect(
      detectCasualAttire([
        { categoryName: "suit", score: 0.85 },
        { categoryName: "jean", score: 0.124 },
      ])
    ).toBe(false);
  });
});
