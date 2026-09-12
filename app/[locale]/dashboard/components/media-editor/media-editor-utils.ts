/**
 * Shared, framework-agnostic helpers and types for the media editor.
 *
 * This file is intentionally free of any Fabric.js / browser-only imports so it
 * can be consumed by any component (image or video) without pulling the canvas
 * engine into unrelated bundles. All Fabric-specific logic lives in
 * `media-editor-canvas.tsx`.
 */

export type MediaType = "image" | "video" | "unsupported"

/** Detect the editable media type from a File's MIME type. */
export function detectMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "unsupported"
}

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

export type FilterPreset =
  | "original"
  | "grayscale"
  | "sepia"
  | "warm"
  | "cool"
  | "contrast"

export interface FilterOption {
  id: FilterPreset
  label: string
}

export const FILTER_PRESETS: FilterOption[] = [
  { id: "original", label: "Original" },
  { id: "grayscale", label: "Grayscale" },
  { id: "sepia", label: "Sepia" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "contrast", label: "High contrast" },
]

/* -------------------------------------------------------------------------- */
/* Aspect ratios                                                              */
/* -------------------------------------------------------------------------- */

export type AspectRatioPreset =
  | "original"
  | "1:1"
  | "4:5"
  | "4:3"
  | "16:9"
  | "9:16"

export interface AspectRatioOption {
  id: AspectRatioPreset
  label: string
  /** width / height, or `null` to follow the source image's own ratio. */
  ratio: number | null
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "original", label: "Original", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
]

/* -------------------------------------------------------------------------- */
/* Zoom                                                                       */
/* -------------------------------------------------------------------------- */

export const ZOOM_MIN = 1
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.01
export const ROTATION_STEP = 90

/* -------------------------------------------------------------------------- */
/* Text                                                                       */
/* -------------------------------------------------------------------------- */

export type TextAlign = "left" | "center" | "right"

/** Serializable snapshot of the currently selected text object. */
export interface TextSelection {
  text: string
  fontSize: number
  bold: boolean
  italic: boolean
  align: TextAlign
  fill: string
}

export const DEFAULT_TEXT_COLOR = "#ffffff"

export const FONT_SIZE_MIN = 8
export const FONT_SIZE_MAX = 160

/* -------------------------------------------------------------------------- */
/* Imperative editor handle                                                   */
/* -------------------------------------------------------------------------- */

export interface EditorExportResult {
  file: File
  blob: Blob
}

/**
 * Imperative surface exposed by the Fabric canvas so the surrounding React UI
 * can drive it without owning Fabric state directly.
 */
export interface ImageEditorHandle {
  addText: () => void
  updateActiveText: (props: Partial<TextSelection>) => void
  removeActiveText: () => void
  hasActiveText: () => boolean
  /** Recenter the image within the crop frame (used by Reset). */
  resetPosition: () => void
  exportImage: () => Promise<EditorExportResult | null>
}

/* -------------------------------------------------------------------------- */
/* Export helpers                                                             */
/* -------------------------------------------------------------------------- */

export interface ExportFormat {
  mime: "image/png" | "image/jpeg"
  extension: string
}

/**
 * Pick an export format that preserves the source format when it is a common
 * raster type, otherwise fall back to PNG (lossless, alpha-safe).
 */
export function getExportFormat(file: File): ExportFormat {
  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    return { mime: "image/jpeg", extension: "jpg" }
  }
  return { mime: "image/png", extension: "png" }
}

/** Build a new File from an exported Blob, reusing the original base name. */
export function createEditedFile(
  blob: Blob,
  originalName: string,
  format: ExportFormat,
): File {
  const dotIndex = originalName.lastIndexOf(".")
  const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName
  return new File([blob], `${baseName}.${format.extension}`, {
    type: format.mime,
    lastModified: Date.now(),
  })
}

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Compute the crop viewport rectangle, centered inside the available canvas
 * area, honoring the requested aspect ratio (or the image's own ratio).
 */
export function computeCropRect(
  canvasWidth: number,
  canvasHeight: number,
  ratio: number | null,
  imageWidth: number,
  imageHeight: number,
  padding = 24,
): Rect {
  const availableWidth = Math.max(1, canvasWidth - padding * 2)
  const availableHeight = Math.max(1, canvasHeight - padding * 2)
  const targetRatio =
    ratio ?? (imageHeight > 0 ? imageWidth / imageHeight : 1)

  let width = availableWidth
  let height = width / targetRatio

  if (height > availableHeight) {
    height = availableHeight
    width = height * targetRatio
  }

  return {
    width,
    height,
    left: (canvasWidth - width) / 2,
    top: (canvasHeight - height) / 2,
  }
}

/**
 * Compute the "cover" scale so the (possibly rotated) image always fills the
 * crop rectangle with no gaps. Rotation by 90/270 swaps the axes.
 */
export function computeCoverScale(
  crop: Rect,
  imageWidth: number,
  imageHeight: number,
  rotation: number,
): number {
  const normalized = ((rotation % 360) + 360) % 360
  const swapped = normalized === 90 || normalized === 270
  const projectedWidth = swapped ? imageHeight : imageWidth
  const projectedHeight = swapped ? imageWidth : imageHeight
  if (projectedWidth <= 0 || projectedHeight <= 0) return 1
  return Math.max(crop.width / projectedWidth, crop.height / projectedHeight)
}

/** Human-readable file size. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  )
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}
