"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { AspectRatioPanel } from "./aspect-ratio-panel"
import { ImageEditPanel } from "./image-edit-panel"
import { ImageFiltersPanel } from "./image-filters-panel"
import { ImageTextPanel } from "./image-text-panel"
import { MediaEditorCanvas } from "./media-editor-canvas"
import {
  MediaEditorToolbar,
  type EditorTool,
} from "./media-editor-toolbar"
import {
  ROTATION_STEP,
  ZOOM_MIN,
  type AspectRatioPreset,
  type FilterPreset,
  type ImageEditorHandle,
  type TextSelection,
} from "./media-editor-utils"

interface ImageEditorProps {
  file: File
  onSave: (file: File, blob: Blob) => void
  onCancel?: () => void
}

export function ImageEditor({ file, onSave, onCancel }: ImageEditorProps) {
  const editorRef = React.useRef<ImageEditorHandle>(null)

  // Create the object URL once per file and revoke it on cleanup.
  const [imageUrl, setImageUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const [activeTool, setActiveTool] = React.useState<EditorTool>("filters")
  const [zoom, setZoom] = React.useState(ZOOM_MIN)
  const [rotation, setRotation] = React.useState(0)
  const [filter, setFilter] = React.useState<FilterPreset>("original")
  const [aspectRatio, setAspectRatio] =
    React.useState<AspectRatioPreset>("original")
  const [textSelection, setTextSelection] =
    React.useState<TextSelection | null>(null)

  const [isReady, setIsReady] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleReset = React.useCallback(() => {
    setZoom(ZOOM_MIN)
    setRotation(0)
    setFilter("original")
    // Aspect ratio is intentionally preserved on reset.
    editorRef.current?.resetPosition()
  }, [])

  const handleSave = React.useCallback(async () => {
    const handle = editorRef.current
    if (!handle) return
    setIsSaving(true)
    try {
      const result = await handle.exportImage()
      if (result) onSave(result.file, result.blob)
    } finally {
      setIsSaving(false)
    }
  }, [onSave])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Preview */}
      <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-lg border">
        {imageUrl && (
          <MediaEditorCanvas
            ref={editorRef}
            imageUrl={imageUrl}
            sourceFile={file}
            zoom={zoom}
            rotation={rotation}
            filter={filter}
            aspectRatio={aspectRatio}
            onReady={() => setIsReady(true)}
            onError={setError}
            onTextSelectionChange={setTextSelection}
          />
        )}
        {!isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {error}
          </div>
        )}
      </div>

      {/* Tools */}
      <MediaEditorToolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <Separator />

      {/* Active tool panel */}
      <div className="min-h-[84px]">
        {activeTool === "filters" && (
          <ImageFiltersPanel value={filter} onChange={setFilter} />
        )}
        {activeTool === "edit" && (
          <ImageEditPanel
            zoom={zoom}
            onZoomChange={setZoom}
            onRotateLeft={() => setRotation((current) => current - ROTATION_STEP)}
            onRotateRight={() =>
              setRotation((current) => current + ROTATION_STEP)
            }
            onReset={handleReset}
          />
        )}
        {activeTool === "text" && (
          <ImageTextPanel
            selection={textSelection}
            onAddText={() => editorRef.current?.addText()}
            onUpdate={(props) => editorRef.current?.updateActiveText(props)}
            onRemove={() => editorRef.current?.removeActiveText()}
          />
        )}
        {activeTool === "aspect" && (
          <AspectRatioPanel value={aspectRatio} onChange={setAspectRatio} />
        )}
      </div>

      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="outline" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          }
        />
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isReady || isSaving || !!error}
        >
          {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </div>
  )
}
