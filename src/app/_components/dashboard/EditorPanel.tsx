"use client";

import React, { useState, useRef, useEffect } from "react";
import { Crop, RotateCcw, SlidersHorizontal, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  computeResolutionWarning,
  computeRatioWarning,
  computeBackgroundWarning,
  computeTopEdgeWarning,
  compressToTarget,
  setJpegDpi,
  clampPositionToCover,
  minCoverZoom,
} from "@/lib/eras-checks";
import { addHistoryRecord } from "@/lib/eras-storage";
import { savePhoto, updatePhotoEditState, getActivePhoto, purgeExpired, clearPhotos, type PhotoEditState } from "@/lib/photo-store";
import { authorizePhotoDownload } from "@/lib/download-workflow";
import { captureException, sanitizeErrorMessage, trackEvent } from "@/lib/analytics-client";
import { HEIC_REJECTION_MESSAGE, isHeicFile } from "@/lib/file-validation";
import { useEraDetectors } from "./editor/useEraDetectors";
import { UploadZone } from "./editor/UploadZone";
import { FilterControls, type Filters } from "./editor/FilterControls";
import { SpecCard, type DownloadPhase } from "./editor/SpecCard";

interface EditorPanelProps {
  user: { email: string; name: string; plan?: "Free" | "Resident" | "Program" };
  // A previously-downloaded photo reopened from "My Photos" — loaded once on
  // mount, then reported back via onInitialPhotoConsumed so the parent can
  // clear it (otherwise switching tabs away and back would reload it again).
  initialPhoto?: { name: string; sizeKB: number; thumbnail: string; blob?: Blob; format?: string } | null;
  onInitialPhotoConsumed?: () => void;
}

export function EditorPanel({ user, initialPhoto, onInitialPhotoConsumed }: EditorPanelProps) {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("headshot.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // The actual uploaded file's own dimensions/size/format — distinct from
  // the fixed 375x525/150dpi/JPEG export spec shown in SpecCard, so users
  // can see what they uploaded vs. what ERAS will receive.
  const [originalInfo, setOriginalInfo] = useState<{ width: number; height: number; sizeKB: number; format: string } | null>(
    null
  );

  // Transform states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(true);

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    bgBoost: 0,
  });

  // Export metadata
  const [exportKB, setExportKB] = useState<number | null>(null);
  // Every async stage of the download flow gets visible UI — never a silent
  // stop. "authorizing" = /api/downloads/authorize in flight, "preparing" =
  // compressing/exporting, "redirecting" = 403 routed to checkout.
  const [downloadPhase, setDownloadPhase] = useState<DownloadPhase>(null);
  const [resolutionWarning, setResolutionWarning] = useState<string | null>(null);
  const [ratioWarning, setRatioWarning] = useState<string | null>(null);
  const [bgWarning, setBgWarning] = useState<string | null>(null);
  const [topEdgeWarning, setTopEdgeWarning] = useState<string | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  // Set when a selected file is rejected before it ever reaches the canvas
  // (e.g. HEIC/HEIF, which browsers can't decode in <img>).
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Pointer-down location for tap detection — a tap (no real movement) on
  // the crop canvas recenters the photo on the tapped point instead of
  // doing nothing (taps with zero feedback were showing up as dead clicks).
  const tapStartRef = useRef<{ x: number; y: number } | null>(null);

  const {
    faceWarning,
    eyewearWarning,
    attireWarning,
    framingWarning,
    poseWarning,
    landmarkerWarning,
    classifierWarning,
    runUploadChecks,
    reset: resetDetectors,
  } = useEraDetectors({ canvasRef, image, zoom, rotation, position, imageSrc });

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImage(file);
    // Allow re-selecting the same file after Upload New
    e.target.value = "";
  };

  // Shared core: loads any image URL (an uploaded file's object URL, or a
  // data URL pulled back out of history) into the editor the same way.
  // `blobToPersist` is passed only when this load should be saved to
  // IndexedDB (a fresh upload) — restoring from photo-store or history
  // re-loads without re-saving.
  const loadImageFromSrc = (
    url: string,
    name: string,
    sizeKB: number,
    format: string,
    blobToPersist?: Blob,
    restoreEditState?: PhotoEditState
  ) => {
    setFileName(name);
    setOriginalInfo({ width: 0, height: 0, sizeKB, format });

    // Mock upload progress — no real upload happens yet, files are read
    // straight off disk into the canvas. Kept here so the UI has a place
    // to hook a real upload percentage once files are sent to a server.
    setIsUploading(true);
    setUploadProgress(0);
    const progressTimer = setInterval(() => {
      setUploadProgress((p) => (p >= 90 ? p : p + 15));
    }, 90);

    const img = new Image();
    img.onload = () => {
      clearInterval(progressTimer);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setImageSrc(url);
      }, 250);

      // Fit image initially — cover-fit plus a small 2% buffer, not the old
      // 10%: a large margin crops symmetrically around the image's geometric
      // center and eats into headroom above the face before it touches the
      // shoulder slack below (see MIN_TOP_HEAD_MARGIN_PX in eras-checks.ts).
      // The small buffer exists so straightening the photo a few degrees
      // (rotation slider) doesn't expose blank canvas at the corners.
      if (restoreEditState) {
        setZoom(restoreEditState.zoom);
        setRotation(restoreEditState.rotation);
        setPosition(restoreEditState.position);
        setFilters(restoreEditState.filters);
      } else {
        setZoom(minCoverZoom(img.width, img.height) * 1.02);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      }
      setImage(img);
      setOriginalInfo((prev) => (prev ? { ...prev, width: img.naturalWidth, height: img.naturalHeight } : prev));

      // Export is 375x525px (2.5x3.5in at 150dpi, matching the JFIF tag we
      // write on download) — any source smaller than that is upscaled from
      // the very first fit, guaranteeing a blurry result no matter how the
      // user crops/zooms afterward.
      setResolutionWarning(computeResolutionWarning(img.naturalWidth, img.naturalHeight));

      // We always cover-fit to the 5:7 (375x525) frame, so any source ratio
      // "works" mechanically — but a source shaped very differently from 5:7
      // (a wide group/landscape shot, or an extreme full-body crop) forces
      // most of the image away just to cover the frame, often taking the
      // subject's positioning with it. Flag it before the user has to guess
      // why the crop looks so tight.
      setRatioWarning(computeRatioWarning(img.naturalWidth, img.naturalHeight));

      runUploadChecks(img);

      if (blobToPersist) {
        savePhoto({
          blob: blobToPersist,
          name,
          sizeKB,
          format,
          editState: {
            zoom: minCoverZoom(img.width, img.height) * 1.02,
            rotation: 0,
            position: { x: 0, y: 0 },
            filters: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, bgBoost: 0 },
          },
        }).catch((err) => console.error("Failed to save photo locally", err));
      }
    };
    img.onerror = () => {
      clearInterval(progressTimer);
      setIsUploading(false);
      setUploadProgress(0);
      setOriginalInfo(null);
      setSizeWarning("Couldn't load this photo — try a different file.");
      captureException(new Error("editor_image_load_failed"), {
        route: "/dashboard",
        action: "editor_image_load",
      });
    };
    img.src = url;
  };

  // Load file
  const loadImage = (file: File) => {
    // Reject HEIC/HEIF immediately on selection — browsers can't decode them
    // in <img>/canvas, so loading one would only end in a dead editor.
    if (isHeicFile(file)) {
      setFileTypeError(HEIC_REJECTION_MESSAGE);
      return;
    }
    setFileTypeError(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    loadImageFromSrc(
      url,
      file.name,
      Math.round(file.size / 100) / 10,
      file.type === "image/png" ? "PNG" : "JPEG",
      file
    );
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Reopen a photo from "My Photos" — the stored thumbnail *is* the exact
  // downloaded JPEG, so it's loaded the same way an upload would be. Falls
  // back to the last in-progress photo-store save (survives reload/return
  // visits for 30 days) when there's no explicit initialPhoto.
  useEffect(() => {
    if (initialPhoto) {
      const timer = window.setTimeout(() => {
        // A blob-backed handoff (Home dropzone) owns an object URL — track it
        // so unmount revokes it, same as the fresh-upload path.
        if (initialPhoto.blob) objectUrlRef.current = initialPhoto.thumbnail;
        loadImageFromSrc(
          initialPhoto.thumbnail,
          initialPhoto.name,
          initialPhoto.sizeKB,
          initialPhoto.format ?? "JPEG",
          initialPhoto.blob
        );
        onInitialPhotoConsumed?.();
      }, 0);
      return () => window.clearTimeout(timer);
    }

    purgeExpired()
      .then(getActivePhoto)
      .then((stored) => {
        if (!stored) return;
        const url = URL.createObjectURL(stored.blob);
        objectUrlRef.current = url;
        loadImageFromSrc(url, stored.name, stored.sizeKB, stored.format, undefined, stored.editState);
      })
      .catch((err) => console.error("Failed to restore saved photo", err));
    // Only ever run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag and Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // Canvas Draw Loop
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Fixed ERAS Specifications
    canvas.width = 375;
    canvas.height = 525;

    // Clear
    ctx.clearRect(0, 0, 375, 525);

    // Save current drawing state
    ctx.save();

    // 1. Draw Background (default white)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 375, 525);

    // 2. Set adjust filters on canvas
    const fBrightness = filters.brightness / 100;
    const fContrast = filters.contrast / 100;
    const fSaturation = filters.saturation / 100;
    ctx.filter = `brightness(${fBrightness}) contrast(${fContrast}) saturate(${fSaturation})`;

    // 3. Move origin to center for rotation and scaling
    ctx.translate(187.5, 262.5);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // 4. Draw image
    // Center the image around the translated offset
    const imgWidth = image.width;
    const imgHeight = image.height;
    ctx.drawImage(image, position.x - imgWidth / 2, position.y - imgHeight / 2, imgWidth, imgHeight);

    // Restore to draw overlays without adjustments
    ctx.restore();

    // 5. Apply Warmth (temperature overlay)
    if (filters.warmth !== 0) {
      ctx.save();
      if (filters.warmth > 0) {
        // Warm gold filter
        ctx.fillStyle = `rgba(217, 119, 6, ${filters.warmth * 0.003})`;
      } else {
        // Cool blue filter
        ctx.fillStyle = `rgba(2, 132, 199, ${Math.abs(filters.warmth) * 0.003})`;
      }
      ctx.globalCompositeOperation = "color";
      ctx.fillRect(0, 0, 375, 525);
      ctx.restore();
    }

    // 6. Apply Background Lightness Boost
    if (filters.bgBoost > 0) {
      ctx.save();
      const imgData = ctx.getImageData(0, 0, 375, 525);
      const data = imgData.data;
      const factor = filters.bgBoost / 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Average brightness
        const brightness = (r + g + b) / 3;

        // If pixels are already relatively bright (light background), boost them towards pure white
        if (brightness > 135) {
          const boost = (255 - brightness) * factor * 0.85;
          data[i] = Math.min(255, r + boost);
          data[i + 1] = Math.min(255, g + boost);
          data[i + 2] = Math.min(255, b + boost);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.restore();
    }

    // ERAS requires a plain, neutral (white/light gray/light blue) background.
    // Only sample the TOP two corners: on a correctly framed headshot the
    // bottom corners are routinely covered by shoulders/collar/blazer fabric,
    // which isn't background at all and would falsely read as "busy" or dark.
    try {
      const corner = 30;
      const topLeft = ctx.getImageData(0, 0, corner, corner).data;
      const topRight = ctx.getImageData(375 - corner, 0, corner, corner).data;
      setBgWarning(computeBackgroundWarning(topLeft, topRight));

      // A thin strip across the top-center of the frame, between the two
      // corners already sampled above — if a head/hair with no margin left
      // is crowding the top edge, this strip won't match the corner background.
      const topCenter = ctx.getImageData(corner, 0, 375 - corner * 2, 4).data;
      setTopEdgeWarning(computeTopEdgeWarning(topCenter, topLeft, topRight));
    } catch (err) {
      console.error("Background check failed", err);
    }

    // Estimate file size locally in real-time
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const base64Len = dataUrl.length - "data:image/jpeg;base64,".length;
      const sizeBytes = base64Len * 0.75;
      setExportKB(Math.round(sizeBytes / 100) / 10);
    } catch (err) {
      console.error("Size calculation failed", err);
    }
  }, [image, zoom, rotation, position, filters, imageSrc]);

  // Debounced autosave of crop/zoom/rotation/filter tweaks to the same
  // photo-store record — a no-op if nothing's been saved yet (no active
  // photo). Debounced so dragging a slider doesn't hammer IndexedDB.
  useEffect(() => {
    if (!image) return;
    const timer = window.setTimeout(() => {
      updatePhotoEditState({ zoom, rotation, position, filters }).catch((err) =>
        console.error("Failed to autosave edit state", err)
      );
    }, 500);
    return () => window.clearTimeout(timer);
  }, [image, zoom, rotation, position, filters]);

  // Pan handlers
  const handleStartDrag = (clientX: number, clientY: number) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x * zoom,
      y: clientY - position.y * zoom,
    });
  };

  const handleDrag = (clientX: number, clientY: number) => {
    if (!isDragging || !image) return;
    // Account for zoom in drag velocity
    const next = {
      x: (clientX - dragStart.x) / zoom,
      y: (clientY - dragStart.y) / zoom,
    };
    // Keep the photo covering the full frame — past this bound an edge would
    // show blank canvas instead of the photo.
    setPosition(clampPositionToCover(next, zoom, image.width, image.height));
  };

  // Pointer Events unify mouse/touch/pen. On pointerdown we claim the
  // gesture with setPointerCapture so the pointer keeps reporting moves even
  // if it leaves the element — and with `touch-action: none` in CSS the
  // browser won't hijack a touch-drag into a page scroll. Mouse behavior is
  // unchanged: pointerdown/move/up carry the same clientX/clientY the old
  // mouse handlers used.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    tapStartRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // setPointerCapture can throw in edge cases — dragging still works,
      // it just won't track outside the element bounds.
    }
    handleStartDrag(e.clientX, e.clientY);
  };

  // A tap (pointerdown → pointerup with barely any movement) recenters the
  // crop on the tapped point. This is the exact inverse of the canvas draw
  // transform (translate → scale → rotate about the frame center), so the
  // tapped image point lands in the middle of the 375×525 frame, clamped to
  // keep the photo covering the frame.
  const handleTapToCenter = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = tapStartRef.current;
    tapStartRef.current = null;
    if (!start || !image) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return; // a drag, not a tap
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Tap point in canvas backing-store pixels (375×525)
    const bx = ((e.clientX - rect.left) / rect.width) * 375;
    const by = ((e.clientY - rect.top) / rect.height) * 525;
    // Undo translate(187.5, 262.5) → scale(zoom) → rotate(rotation)
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const px = (bx - 187.5) / zoom;
    const py = (by - 262.5) / zoom;
    const ux = px * cos + py * sin;
    const uy = -px * sin + py * cos;
    const ix = ux - position.x + image.width / 2;
    const iy = uy - position.y + image.height / 2;
    setPosition(
      clampPositionToCover(
        { x: image.width / 2 - ix, y: image.height / 2 - iy },
        zoom,
        image.width,
        image.height
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    handleTapToCenter(e);
    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    tapStartRef.current = null;
    setIsDragging(false);
  };

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!image) return;
    const step = e.shiftKey ? 10 : 4;
    const next = { ...position };

    if (e.key === "ArrowLeft") next.x += step;
    else if (e.key === "ArrowRight") next.x -= step;
    else if (e.key === "ArrowUp") next.y += step;
    else if (e.key === "ArrowDown") next.y -= step;
    else return;

    e.preventDefault();
    setPosition(clampPositionToCover(next, zoom, image.width, image.height));
  };

  // Zoom can also uncover the frame (zooming out past the point where the
  // image still spans 375x525), so it's floored at minCoverZoom and the
  // current position is re-clamped to the new zoom's tighter bounds.
  const handleZoomChange = (nextZoom: number) => {
    if (!image) {
      setZoom(nextZoom);
      return;
    }
    const clampedZoom = Math.max(nextZoom, minCoverZoom(image.width, image.height));
    setZoom(clampedZoom);
    setPosition((prev) => clampPositionToCover(prev, clampedZoom, image.width, image.height));
  };

  // Download with Smart Compression
  const handleDownload = async () => {
    if (!canvasRef.current || !image || downloadPhase !== null) return;
    const plan = user.plan ?? "Free";
    trackEvent("download_clicked", { action: "download_clicked", extra: { plan, locked: plan === "Free" } });
    setDownloadPhase("authorizing");
    setDownloadError(null);
    const canvas = canvasRef.current;

    try {
      const authorization = await authorizePhotoDownload({
        request: () => fetch("/api/downloads/authorize", { method: "POST" }),
        openCheckout: () => {},
      });
      if (!authorization.allowed) {
        // 403: free plan needs the Resident upgrade. Keep the existing
        // routing, but make the handoff visible instead of a silent stop.
        trackEvent("download_forbidden", { action: "download_forbidden", extra: { plan } });
        setDownloadPhase("redirecting");
        router.push("/checkout?plan=Resident");
        return;
      }
      trackEvent("download_authorized", { action: "download_authorized", extra: { plan } });
      setDownloadPhase("preparing");

      await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
      const estimateSize = (quality: number) => {
        const url = canvas.toDataURL("image/jpeg", quality);
        const base64Len = url.length - "data:image/jpeg;base64,".length;
        return base64Len * 0.75;
      };

      const { quality, sizeBytes, exceedsLimit } = compressToTarget(estimateSize);
      let dataUrl = canvas.toDataURL("image/jpeg", quality);

      // Canvas export never writes a DPI tag (browsers default JFIF density
      // to 1:1 "aspect ratio", not physical units), so a 375x525px file —
      // sized correctly for 2.5x3.5in at 150dpi — reads back as
      // 72dpi/undefined. Patch the JFIF APP0 density fields to state 150dpi.
      const patched = setJpegDpi(dataUrl, 150);
      dataUrl = patched.dataUrl;

      setSizeWarning(
        exceedsLimit
          ? "Couldn't compress under 150 KB even at minimum quality — try a simpler background or lower-resolution source photo."
          : null
      );

      // Download trigger
      const link = document.createElement("a");
      const cleanName = fileName.replace(/\.[^/.]+$/, "");
      link.download = `${cleanName}_eras.jpg`;
      link.href = dataUrl;
      link.click();

      addHistoryRecord({
        id: Date.now().toString(),
        name: `${cleanName}_eras.jpg`,
        sizeKB: Math.round(sizeBytes / 100) / 10,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        thumbnail: dataUrl,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not authorize this download.";
      setDownloadError(message);
      trackEvent("download_failed", {
        action: "download_failed",
        extra: { plan, error: sanitizeErrorMessage(message) },
      });
      captureException(error, { route: "/dashboard", action: "download_authorize" });
    } finally {
      // Leave the "redirecting" phase up while checkout navigation happens.
      setDownloadPhase((phase) => (phase === "redirecting" ? phase : null));
    }
  };

  const handleReset = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    clearPhotos().catch((err) => console.error("Failed to clear saved photo", err));
    setImageSrc(null);
    setImage(null);
    setOriginalInfo(null);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      bgBoost: 0,
    });
    setResolutionWarning(null);
    setRatioWarning(null);
    setBgWarning(null);
    setTopEdgeWarning(null);
    setSizeWarning(null);
    setExportKB(null);
    resetDetectors();
  };

  const handleResetCrop = () => {
    if (!image) return;
    setZoom(minCoverZoom(image.width, image.height) * 1.02);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up font-sans">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Prepare your ERAS photo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Crop, adjust, and export a polished headshot sized for your residency application.</p>
        </div>
        {imageSrc && <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-medium text-primary-dark"><Crop aria-hidden={true} className="h-4 w-4" />Editing {fileName}</div>}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN: Workspace */}
      <div className="space-y-6 lg:col-span-8">
        {fileTypeError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
            {fileTypeError}
          </p>
        )}
        {isUploading ? (
          <div aria-live="polite" className="border-2 border-dashed border-slate-300 rounded-lg p-12 bg-white flex flex-col items-center justify-center text-center min-h-[350px]">
            <span className="text-sm font-semibold text-heading mb-4">Uploading {fileName}…</span>
            <div className="w-full max-w-xs h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-150 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-muted mt-3">{uploadProgress}%</span>
          </div>
        ) : !imageSrc ? (
          <UploadZone onFileChange={handleFileChange} onDrop={handleDrop} />
        ) : (
          /* Interactive Workspace */
          <div className="card bg-white p-5 space-y-6 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-heading truncate max-w-[200px] block">{fileName}</span>
                <span className="text-xs text-muted mt-1 block">
                  {originalInfo && originalInfo.width > 0
                    ? `Original: ${originalInfo.width} × ${originalInfo.height}px · ${originalInfo.sizeKB} KB · ${originalInfo.format} — click and drag to reposition`
                    : "Click and drag the photo to reposition it"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  tabIndex={-1}
                  onChange={handleFileChange}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-heading shadow-sm transition hover:border-primary hover:text-primary active:scale-[0.97]"
                >
                  <Upload aria-hidden={true} className="h-3.5 w-3.5" />
                  Upload New
                </button>
                <span aria-hidden="true" className="hidden h-5 w-px bg-slate-200 sm:block" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showGuide}
                    onClick={() => setShowGuide(!showGuide)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      showGuide ? "bg-primary" : "bg-slate-300"
                    }`}
                    aria-label="Toggle composition guide overlay"
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        showGuide ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium text-muted">
                    Guide
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetCrop}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.97]"
                >
                  <RotateCcw aria-hidden={true} className="h-3.5 w-3.5" />
                  Reset Crop
                </button>
              </div>
            </div>

            {/* Canvas Viewport Box */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 select-none sm:p-6">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent" />
              <div className="relative mb-4 flex items-center justify-center gap-2 text-xs font-medium text-muted"><Crop aria-hidden={true} className="h-3.5 w-3.5 text-primary" />Drag to reposition · Tap to center · Arrow keys for fine adjustment</div>
              <div
                className="relative w-[min(375px,100%)] aspect-[5/7] overflow-hidden cursor-move touch-none shadow-2xl bg-white border border-slate-700/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                role="application"
                tabIndex={0}
                aria-label="Photo crop canvas. Drag to reposition, tap to center on a point, or use arrow keys for fine adjustment."
                onPointerDown={handlePointerDown}
                onPointerMove={(e) => handleDrag(e.clientX, e.clientY)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onKeyDown={handleCanvasKeyDown}
              >
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Stencil Overlay Guide */}
                {showGuide && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
                    viewBox="0 0 375 525"
                    fill="none"
                  >
                    {/* Dark overlay borders outside head region slightly darkened if preferred (simple stencil) */}
                    <rect width="375" height="525" fill="black" fillOpacity="0.15" />

                    {/* Head Oval cut-out */}
                    <ellipse cx="187.5" cy="225" rx="85" ry="120" stroke="white" strokeWidth="2" strokeDasharray="6 6" fill="none" className="opacity-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                    <ellipse cx="187.5" cy="225" rx="84" ry="119" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="none" fill="none" />

                    {/* Guidelines */}
                    {/* Eye line */}
                    <line x1="30" y1="195" x2="345" y2="195" stroke="white" strokeWidth="1" strokeDasharray="3 3" className="opacity-80" />
                    <text x="35" y="190" fill="white" fontSize="7" fontFamily="var(--font-mono)" fontWeight="bold" className="opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">EYE LINE</text>

                    {/* Chin level */}
                    <line x1="60" y1="345" x2="315" y2="345" stroke="white" strokeWidth="1" strokeDasharray="3 3" className="opacity-80" />
                    <text x="65" y="340" fill="white" fontSize="7" fontFamily="var(--font-mono)" fontWeight="bold" className="opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">CHIN LEVEL</text>

                    {/* Top of head */}
                    <line x1="60" y1="105" x2="315" y2="105" stroke="white" strokeWidth="1" strokeDasharray="3 3" className="opacity-80" />
                    <text x="65" y="120" fill="white" fontSize="7" fontFamily="var(--font-mono)" fontWeight="bold" className="opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">TOP OF HEAD</text>

                    {/* Shoulders path stencil */}
                    <path d="M 40 500 Q 90 410 187.5 410 Q 285 410 335 500" stroke="white" strokeWidth="2" strokeDasharray="6 6" fill="none" className="opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                    <path d="M 40 500 Q 90 410 187.5 410 Q 285 410 335 500" stroke="var(--color-primary)" strokeWidth="1" fill="none" />
                    <text x="187.5" y="430" textAnchor="middle" fill="white" fontSize="7" fontFamily="var(--font-mono)" fontWeight="bold" className="opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">SHOULDER LINE</text>
                  </svg>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5"><h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-heading"><SlidersHorizontal aria-hidden={true} className="h-4 w-4 text-primary" />Adjustments</h2><FilterControls zoom={zoom} minZoom={image ? minCoverZoom(image.width, image.height) : 0.2} onZoomChange={handleZoomChange} rotation={rotation} onRotationChange={setRotation} filters={filters} onFiltersChange={setFilters} /></div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Spec Card & Validation */}
      <div className="lg:col-span-4">
        {downloadError && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm leading-6 text-red-700">{downloadError}</p>
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={downloadPhase !== null}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}
        <SpecCard
          imageSrc={imageSrc}
          exportKB={exportKB}
          downloadPhase={downloadPhase}
          onDownload={handleDownload}
          downloadLocked={(user.plan ?? "Free") === "Free"}
          onReset={handleReset}
          resolutionWarning={resolutionWarning}
          ratioWarning={ratioWarning}
          bgWarning={bgWarning}
          topEdgeWarning={topEdgeWarning}
          faceWarning={faceWarning}
          eyewearWarning={eyewearWarning}
          attireWarning={attireWarning}
          framingWarning={framingWarning}
          poseWarning={poseWarning}
          landmarkerWarning={landmarkerWarning}
          classifierWarning={classifierWarning}
          sizeWarning={sizeWarning}
        />
      </div>
      </div>
    </div>
  );
}
