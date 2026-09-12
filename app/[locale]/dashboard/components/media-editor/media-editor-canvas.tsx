"use client"

/**
 * MediaEditorCanvas
 * -----------------
 * The single home of all Fabric.js logic. Everything that touches the Fabric
 * engine lives here so the rest of the editor stays plain React.
 *
 * Key design rules (see the prompt / README):
 *  - The Fabric canvas fills the available preview area and is fully responsive
 *    via a ResizeObserver. It is created exactly once and disposed on unmount.
 *  - The image is placed behind a FIXED crop viewport. Filters, zoom, rotation
 *    and panning transform the image; the crop frame never moves. Only the crop
 *    region is exported.
 *  - The image has no native Fabric resize/rotate handles — transformations
 *    happen only through the editor controls. Text objects DO keep their
 *    handles so they can be moved, scaled and rotated directly.
 *
 * React state (zoom / rotation / filter / aspect ratio) flows in through props
 * and is applied to Fabric imperatively via effects. Text editing and export
 * are exposed through an imperative handle. Fabric state stays inside Fabric.
 */

import * as React from "react"
import {
  Canvas,
  FabricImage,
  Textbox,
  filters as fabricFilters,
} from "fabric"

import {
  clamp,
  computeCoverScale,
  computeCropRect,
  createEditedFile,
  DEFAULT_TEXT_COLOR,
  getExportFormat,
  type AspectRatioPreset,
  type FilterPreset,
  type ImageEditorHandle,
  type Rect,
  type TextSelection,
  ASPECT_RATIOS,
} from "./media-editor-utils"

interface MediaEditorCanvasProps {
  /** Object URL for the source image. Owned (and revoked) by the parent. */
  imageUrl: string
  /** Original file — used only to derive the export name and format. */
  sourceFile: File
  zoom: number
  rotation: number
  filter: FilterPreset
  aspectRatio: AspectRatioPreset
  onReady?: () => void
  onError?: (message: string) => void
  /** Fired whenever the active text object changes (or is cleared). */
  onTextSelectionChange?: (selection: TextSelection | null) => void
}

/* Build the Fabric filter stack for a preset. Kept beside the engine so the
 * pure utils file stays Fabric-free. Extend by adding cases here. */
function buildFilterStack(preset: FilterPreset): FabricImage["filters"] {
  switch (preset) {
    case "grayscale":
      return [new fabricFilters.Grayscale()]
    case "sepia":
      return [new fabricFilters.Sepia()]
    case "warm":
      return [
        new fabricFilters.Saturation({ saturation: 0.15 }),
        // Push reds up, blues down for a warm cast.
        new fabricFilters.ColorMatrix({
          matrix: [
            1.1, 0, 0, 0, 0, 0, 1.02, 0, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 1, 0,
          ],
        }),
      ]
    case "cool":
      return [
        new fabricFilters.Saturation({ saturation: 0.1 }),
        // Push blues up, reds down for a cool cast.
        new fabricFilters.ColorMatrix({
          matrix: [
            0.88, 0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 0, 1.15, 0, 0, 0, 0, 0, 1, 0,
          ],
        }),
      ]
    case "contrast":
      return [
        new fabricFilters.Contrast({ contrast: 0.25 }),
        new fabricFilters.Saturation({ saturation: 0.1 }),
      ]
    case "original":
    default:
      return []
  }
}

function readTextSelection(object: Textbox): TextSelection {
  const scaleX = object.scaleX ?? 1
  const weight = object.fontWeight
  const align = object.textAlign
  return {
    text: object.text ?? "",
    fontSize: Math.round((object.fontSize ?? 24) * scaleX),
    bold: weight === "bold" || weight === 700,
    italic: object.fontStyle === "italic",
    align: align === "center" || align === "right" ? align : "left",
    fill: typeof object.fill === "string" ? object.fill : DEFAULT_TEXT_COLOR,
  }
}

export const MediaEditorCanvas = React.forwardRef<
  ImageEditorHandle,
  MediaEditorCanvasProps
>(function MediaEditorCanvas(
  {
    imageUrl,
    sourceFile,
    zoom,
    rotation,
    filter,
    aspectRatio,
    onReady,
    onError,
    onTextSelectionChange,
  },
  ref,
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const canvasElRef = React.useRef<HTMLCanvasElement | null>(null)

  // Fabric state — kept in refs so it survives React re-renders and never
  // triggers a canvas rebuild.
  const fabricRef = React.useRef<Canvas | null>(null)
  const imageRef = React.useRef<FabricImage | null>(null)
  const baseScaleRef = React.useRef<number>(1)
  const cropRef = React.useRef<Rect>({ left: 0, top: 0, width: 0, height: 0 })

  // Mirror the latest props so async callbacks (image load, resize observer)
  // always read current values without re-subscribing.
  const propsRef = React.useRef({ zoom, rotation, filter, aspectRatio })
  // eslint-disable-next-line react-hooks/refs
  propsRef.current = { zoom, rotation, filter, aspectRatio }

  const callbacksRef = React.useRef({ onReady, onError, onTextSelectionChange })
  // eslint-disable-next-line react-hooks/refs
  callbacksRef.current = { onReady, onError, onTextSelectionChange }

  // Crop rectangle mirrored into React state so the DOM overlay can render it.
  const [overlay, setOverlay] = React.useState<Rect>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const resolveRatio = React.useCallback(
    (preset: AspectRatioPreset): number | null =>
      ASPECT_RATIOS.find((option) => option.id === preset)?.ratio ?? null,
    [],
  )

  /** Keep the image covering the crop frame — prevents empty gaps on pan. */
  const clampImageToCrop = React.useCallback(() => {
    const image = imageRef.current
    if (!image) return
    const crop = cropRef.current
    const bounds = image.getBoundingRect()
    let dx = 0
    let dy = 0

    if (bounds.left > crop.left) dx = crop.left - bounds.left
    else if (bounds.left + bounds.width < crop.left + crop.width)
      dx = crop.left + crop.width - (bounds.left + bounds.width)

    if (bounds.top > crop.top) dy = crop.top - bounds.top
    else if (bounds.top + bounds.height < crop.top + crop.height)
      dy = crop.top + crop.height - (bounds.top + bounds.height)

    if (dx !== 0 || dy !== 0) {
      image.set({ left: (image.left ?? 0) + dx, top: (image.top ?? 0) + dy })
      image.setCoords()
    }
  }, [])

  /**
   * Recompute canvas size, crop frame and the image's cover scale, then apply
   * the current zoom / rotation. `recenter` moves the image back to the crop
   * center (used on layout / aspect changes, but not on plain zoom).
   */
  const layout = React.useCallback(
    (recenter: boolean) => {
      const canvas = fabricRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const width = container.clientWidth
      const height = container.clientHeight
      if (width <= 0 || height <= 0) return

      canvas.setDimensions({ width, height })

      const image = imageRef.current
      const { zoom: z, rotation: r, aspectRatio: ar } = propsRef.current

      const naturalWidth = image?.getOriginalSize().width ?? width
      const naturalHeight = image?.getOriginalSize().height ?? height

      const crop = computeCropRect(
        width,
        height,
        resolveRatio(ar),
        naturalWidth,
        naturalHeight,
      )
      cropRef.current = crop
      setOverlay(crop)

      if (image) {
        const base = computeCoverScale(crop, naturalWidth, naturalHeight, r)
        baseScaleRef.current = base
        const scale = base * z
        image.set({ scaleX: scale, scaleY: scale, angle: r })
        if (recenter) {
          image.set({
            left: crop.left + crop.width / 2,
            top: crop.top + crop.height / 2,
          })
        }
        image.setCoords()
        clampImageToCrop()
      }

      canvas.requestRenderAll()
    },
    [resolveRatio, clampImageToCrop],
  )

  /* --------------------------- initialization --------------------------- */
  React.useEffect(() => {
    // Guard against double init (React strict mode / re-entrancy).
    if (fabricRef.current || !canvasElRef.current) return

    let disposed = false
    const canvas = new Canvas(canvasElRef.current, {
      preserveObjectStacking: true,
      selection: false,
      controlsAboveOverlay: true,
      backgroundColor: undefined,
    })
    fabricRef.current = canvas

    // Emit text selection changes from a single place.
    const emitSelection = () => {
      const active = canvas.getActiveObject()
      const selection =
        active instanceof Textbox ? readTextSelection(active) : null
      callbacksRef.current.onTextSelectionChange?.(selection)
    }
    canvas.on("selection:created", emitSelection)
    canvas.on("selection:updated", emitSelection)
    canvas.on("selection:cleared", emitSelection)
    canvas.on("object:modified", emitSelection)

    // Keep the image locked to the crop frame while panning.
    canvas.on("object:moving", (event) => {
      if (event.target === imageRef.current) clampImageToCrop()
    })

    FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" })
      .then((image) => {
        if (disposed) return
        // Image transforms happen only through the editor controls: no native
        // scaling/rotation handles, no selection border, centered origin.
        image.set({
          originX: "center",
          originY: "center",
          selectable: true,
          hasControls: false,
          hasBorders: false,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hoverCursor: "grab",
          moveCursor: "grabbing",
        })
        image.filters = buildFilterStack(propsRef.current.filter)
        image.applyFilters()
        imageRef.current = image
        canvas.add(image)
        layout(true)
        callbacksRef.current.onReady?.()
      })
      .catch(() => {
        if (!disposed) callbacksRef.current.onError?.("Could not load the image.")
      })

    return () => {
      disposed = true
      fabricRef.current = null
      imageRef.current = null
      void canvas.dispose()
    }
    // Intentionally only depends on the image URL: the canvas must not be
    // rebuilt when UI state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  /* ------------------------- responsive resizing ------------------------ */
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => layout(false))
    observer.observe(container)
    return () => observer.disconnect()
  }, [layout])

  /* ----------------------------- zoom effect ---------------------------- */
  React.useEffect(() => {
    const image = imageRef.current
    const canvas = fabricRef.current
    if (!image || !canvas) return
    const scale = baseScaleRef.current * zoom
    image.set({ scaleX: scale, scaleY: scale })
    image.setCoords()
    clampImageToCrop()
    canvas.requestRenderAll()
  }, [zoom, clampImageToCrop])

  /* --------------------------- rotation effect -------------------------- */
  React.useEffect(() => {
    // Rotation changes the cover scale, so recompute the full layout while
    // keeping the image centered on the crop.
    layout(true)
  }, [rotation, layout])

  /* ---------------------------- filter effect --------------------------- */
  React.useEffect(() => {
    const image = imageRef.current
    const canvas = fabricRef.current
    if (!image || !canvas) return
    image.filters = buildFilterStack(filter)
    image.applyFilters()
    canvas.requestRenderAll()
  }, [filter])

  /* ------------------------- aspect ratio effect ------------------------ */
  React.useEffect(() => {
    layout(true)
  }, [aspectRatio, layout])

  /* ------------------------- imperative handle -------------------------- */
  React.useImperativeHandle(
    ref,
    (): ImageEditorHandle => ({
      addText: () => {
        const canvas = fabricRef.current
        if (!canvas) return
        const crop = cropRef.current
        const textbox = new Textbox("Your text", {
          left: crop.left + crop.width / 2,
          top: crop.top + crop.height / 2,
          originX: "center",
          originY: "center",
          width: Math.max(120, crop.width * 0.6),
          fontSize: Math.max(16, Math.round(crop.height * 0.09)),
          fill: DEFAULT_TEXT_COLOR,
          fontFamily: "sans-serif",
          textAlign: "center",
          editable: true,
        })
        canvas.add(textbox)
        canvas.setActiveObject(textbox)
        canvas.requestRenderAll()
        callbacksRef.current.onTextSelectionChange?.(readTextSelection(textbox))
      },
      updateActiveText: (props: Partial<TextSelection>) => {
        const canvas = fabricRef.current
        const active = canvas?.getActiveObject()
        if (!canvas || !(active instanceof Textbox)) return
        if (props.text !== undefined) active.set({ text: props.text })
        if (props.fontSize !== undefined) {
          // Normalize any handle-scaling back into fontSize so the value stays
          // meaningful and predictable.
          active.set({ fontSize: props.fontSize, scaleX: 1, scaleY: 1 })
        }
        if (props.bold !== undefined)
          active.set({ fontWeight: props.bold ? "bold" : "normal" })
        if (props.italic !== undefined)
          active.set({ fontStyle: props.italic ? "italic" : "normal" })
        if (props.align !== undefined) active.set({ textAlign: props.align })
        if (props.fill !== undefined) active.set({ fill: props.fill })
        active.setCoords()
        canvas.requestRenderAll()
        callbacksRef.current.onTextSelectionChange?.(readTextSelection(active))
      },
      removeActiveText: () => {
        const canvas = fabricRef.current
        const active = canvas?.getActiveObject()
        if (!canvas || !(active instanceof Textbox)) return
        canvas.remove(active)
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        callbacksRef.current.onTextSelectionChange?.(null)
      },
      hasActiveText: () => fabricRef.current?.getActiveObject() instanceof Textbox,
      resetPosition: () => layout(true),
      exportImage: async () => {
        const canvas = fabricRef.current
        const image = imageRef.current
        if (!canvas || !image) return null

        // Don't export selection borders/handles.
        canvas.discardActiveObject()
        canvas.renderAll()
        callbacksRef.current.onTextSelectionChange?.(null)

        const crop = cropRef.current
        const naturalScale = image.scaleX ?? 1
        // Preserve native resolution where reasonable, capped to avoid huge
        // exports and floored at 1 so we never downscale below display size.
        const widthCap = crop.width > 0 ? 4000 / crop.width : 4
        const multiplier = clamp(
          Math.min(naturalScale > 0 ? 1 / naturalScale : 1, widthCap),
          1,
          4,
        )

        // Detached canvas: independent of the live Fabric canvas, so the export
        // completes safely even if the dialog unmounts right after Save.
        const rendered = canvas.toCanvasElement(multiplier, {
          left: crop.left,
          top: crop.top,
          width: crop.width,
          height: crop.height,
        })

        const format = getExportFormat(sourceFile)
        let output = rendered
        if (format.mime === "image/jpeg") {
          // JPEG has no alpha — composite onto white first.
          const flattened = document.createElement("canvas")
          flattened.width = rendered.width
          flattened.height = rendered.height
          const context = flattened.getContext("2d")
          if (context) {
            context.fillStyle = "#ffffff"
            context.fillRect(0, 0, flattened.width, flattened.height)
            context.drawImage(rendered, 0, 0)
            output = flattened
          }
        }

        const blob = await new Promise<Blob | null>((resolve) => {
          output.toBlob((result) => resolve(result), format.mime, 0.92)
        })
        if (!blob) return null

        return { blob, file: createEditedFile(blob, sourceFile.name, format) }
      },
    }),
    [layout],
  )

  return (
    <div
      ref={containerRef}
      className="relative size-full overflow-hidden bg-muted/40"
    >
      <canvas ref={canvasElRef} className="absolute inset-0" />
      {/* Crop overlay — purely decorative, never intercepts pointer events so
          the image underneath stays draggable. */}
      <CropOverlay rect={overlay} />
    </div>
  )
})

/** Dimming mask + framing lines for the crop viewport. */
function CropOverlay({ rect }: { rect: Rect }) {
  if (rect.width <= 0 || rect.height <= 0) return null
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Four dimming panels around the crop frame. */}
      <div
        className="absolute inset-x-0 top-0 bg-background/60"
        style={{ height: rect.top }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-background/60"
        style={{ top: rect.top + rect.height }}
      />
      <div
        className="absolute left-0 bg-background/60"
        style={{ top: rect.top, height: rect.height, width: rect.left }}
      />
      <div
        className="absolute right-0 bg-background/60"
        style={{ top: rect.top, height: rect.height, left: rect.left + rect.width }}
      />
      {/* Frame with subtle rule-of-thirds guides. */}
      <div
        className="absolute rounded-xs ring-1 ring-foreground/40"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      >
        <div className="absolute inset-y-0 left-1/3 w-px bg-foreground/15" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-foreground/15" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-foreground/15" />
        <div className="absolute inset-x-0 top-2/3 h-px bg-foreground/15" />
      </div>
    </div>
  )
}
