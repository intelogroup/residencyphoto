import { useEffect, useRef, useState } from "react";
import { getFaceLandmarker, getClassifier } from "@/lib/eras-ml";
import { computeFramingWarning, computePoseWarning, type FaceCountResult } from "@/lib/eras-checks";

interface UseEraDetectorsArgs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  zoom: number;
  rotation: number;
  position: { x: number; y: number };
  imageSrc: string | null;
}

// All ML-backed ERAS compliance checks (face presence, eyewear, attire,
// post-crop framing/pose) live here, split out of EditorPanel so the
// component doesn't have to hold model-loading + detection logic in its head
// alongside canvas rendering and drag state.
export function useEraDetectors({ canvasRef, image, zoom, rotation, position, imageSrc }: UseEraDetectorsArgs) {
  const [faceWarning, setFaceWarning] = useState<string | null>(null);
  const [eyewearWarning, setEyewearWarning] = useState<string | null>(null);
  const [attireWarning, setAttireWarning] = useState<string | null>(null);
  const [framingWarning, setFramingWarning] = useState<string | null>(null);
  const [poseWarning, setPoseWarning] = useState<string | null>(null);
  // Distinct from the checks above: those report what the model *found*.
  // These report that a model failed to load at all, so the checks it backs
  // never ran — without this, a load failure silently no-ops every warning
  // above and the photo reads as fully compliant when nothing was verified.
  const [landmarkerWarning, setLandmarkerWarning] = useState<string | null>(null);
  const [classifierWarning, setClassifierWarning] = useState<string | null>(null);
  const framingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const detectFace = async (img: HTMLImageElement) => {
    try {
      const landmarker = await getFaceLandmarker();
      setLandmarkerWarning(null);
      const result = landmarker.detect(img);
      const faceCount = result.faceLandmarks?.length ?? 0;

      if (faceCount === 0) {
        setFaceWarning("No face detected — ERAS requires a clear, forward-facing headshot.");
      } else if (faceCount > 1) {
        setFaceWarning("Multiple faces detected — the photo must show only the applicant.");
      } else {
        setFaceWarning(null);
      }
    } catch (err) {
      console.error("Face check failed", err);
      setLandmarkerWarning("Couldn't verify face detection, framing, or pose — the detection model failed to load. Review this manually before downloading.");
    }
  };

  const detectEyewear = async (img: HTMLImageElement) => {
    try {
      const classifier = await getClassifier();
      setClassifierWarning(null);
      const labels = ["a person wearing sunglasses or dark tinted glasses", "a person with bare, clearly visible eyes"];
      const result = await classifier(img.src, labels);
      const top = Array.isArray(result) ? result[0] : result;

      if (top?.label === labels[0] && top.score > 0.6) {
        setEyewearWarning("Sunglasses or tinted glasses detected — ERAS requires your eyes to be clearly visible.");
      } else {
        setEyewearWarning(null);
      }
    } catch (err) {
      console.error("Eyewear check failed", err);
      setClassifierWarning("Couldn't verify eyewear or attire — the classifier model failed to load. Review this manually before downloading.");
    }
  };

  // Advisory, not a hard requirement — AAMC's own guidance says "business
  // attire recommended," not mandatory, so keep the threshold conservative.
  const detectAttire = async (img: HTMLImageElement) => {
    try {
      const classifier = await getClassifier();
      setClassifierWarning(null);
      const labels = [
        "a person wearing formal business attire such as a suit, blazer, or collared shirt",
        "a person wearing casual clothing such as a t-shirt or hoodie",
      ];
      const result = await classifier(img.src, labels);
      const top = Array.isArray(result) ? result[0] : result;

      if (top?.label === labels[1] && top.score > 0.65) {
        setAttireWarning("Clothing looks casual — ERAS recommends business attire (suit, blazer, or collared shirt).");
      } else {
        setAttireWarning(null);
      }
    } catch (err) {
      console.error("Attire check failed", err);
      setClassifierWarning("Couldn't verify eyewear or attire — the classifier model failed to load. Review this manually before downloading.");
    }
  };

  // Sequential, not parallel: the CLIP classifier instance isn't safe to call
  // twice concurrently, and sunglasses/attire are two separate binary questions
  // (mixing their labels into one call would normalize scores across both).
  const runUploadChecks = async (img: HTMLImageElement) => {
    setFaceWarning(null);
    setEyewearWarning(null);
    setAttireWarning(null);
    await detectFace(img);
    await detectEyewear(img);
    await detectAttire(img);
  };

  const checkFramingAndPose = async (canvas: HTMLCanvasElement) => {
    try {
      const landmarker = await getFaceLandmarker();
      setLandmarkerWarning(null);
      const snapshot = new Image();
      snapshot.src = canvas.toDataURL("image/jpeg", 0.8);
      await new Promise<void>((resolve) => {
        snapshot.onload = () => resolve();
        snapshot.onerror = () => resolve();
      });

      const result = landmarker.detect(snapshot);
      const landmarks = result.faceLandmarks ?? [];
      const face: FaceCountResult =
        landmarks.length === 0
          ? { kind: "none" }
          : landmarks.length > 1
            ? { kind: "multiple" }
            : { kind: "one", landmarks: landmarks[0] };

      // Framing/pose runs against the actual cropped canvas, so it supersedes
      // the upload-time face count (faceWarning): cropping can put a face
      // that was one-of-many, or missing, back into a single clean frame —
      // and the reverse. This is the single source of truth once a crop exists.
      setFaceWarning(null);
      setFramingWarning(computeFramingWarning(face));
      setPoseWarning(computePoseWarning(face));
    } catch (err) {
      console.error("Framing/pose check failed", err);
      setLandmarkerWarning("Couldn't verify face detection, framing, or pose — the detection model failed to load. Review this manually before downloading.");
    }
  };

  // Framing/pose check against the actual cropped canvas (not the raw upload) —
  // zoom/pan change what's actually in frame. Debounced since landmark
  // detection is too heavy to run on every drag-move tick.
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;

    if (framingTimer.current) clearTimeout(framingTimer.current);
    framingTimer.current = setTimeout(() => {
      checkFramingAndPose(canvas);
    }, 400);

    return () => {
      if (framingTimer.current) clearTimeout(framingTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, zoom, rotation, position, imageSrc]);

  const reset = () => {
    setFaceWarning(null);
    setEyewearWarning(null);
    setAttireWarning(null);
    setFramingWarning(null);
    setPoseWarning(null);
    setLandmarkerWarning(null);
    setClassifierWarning(null);
  };

  return {
    faceWarning,
    eyewearWarning,
    attireWarning,
    framingWarning,
    poseWarning,
    landmarkerWarning,
    classifierWarning,
    runUploadChecks,
    reset,
  };
}
