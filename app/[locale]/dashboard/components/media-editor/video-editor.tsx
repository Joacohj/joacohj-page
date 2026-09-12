"use client"

/**
 * VideoEditor
 * -----------
 * Mirrors the ImageEditor's public API ({ file, onSave, onCancel }) so both
 * media types are interchangeable from the parent's perspective.
 *
 * Video processing (trim / crop / aspect ratio / filters / volume) is not yet
 * implemented — Fabric.js is deliberately scoped to images only. For now this
 * provides a clean preview with native playback and passes the original file
 * through on Save. The toolbar below is structured so each future capability
 * can be dropped into its own panel exactly like the image editor.
 */

import * as React from "react"
import { Crop, Scissors, SlidersHorizontal, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface VideoEditorProps {
  file: File
  onSave: (file: File, blob: Blob) => void
  onCancel?: () => void
}

const PLANNED_TOOLS = [
  { label: "Trim", icon: Scissors },
  { label: "Crop", icon: Crop },
  { label: "Filters", icon: SlidersHorizontal },
  { label: "Volume", icon: Volume2 },
]

export function VideoEditor({ file, onSave, onCancel }: VideoEditorProps) {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    const url = URL.createObjectURL(file)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            playsInline
            className="max-h-full max-w-full"
          />
        )}
      </div>

      {/* Placeholder toolbar — kept visually consistent with the image editor. */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {PLANNED_TOOLS.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant="ghost"
            disabled
            title="Coming soon"
          >
            <Icon data-icon="inline-start" />
            {label}
          </Button>
        ))}
      </div>
      <Separator />
      <div className="min-h-[84px]">
        <p className="text-sm text-muted-foreground">
          Video editing tools are coming soon. Your video will be saved as-is
          for now.
        </p>
      </div>

      <DialogFooter>
        <DialogClose
          render={
            <Button type="button" variant="outline" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          }
        />
        <Button type="button" onClick={() => onSave(file, file)}>
          Save
        </Button>
      </DialogFooter>
    </div>
  )
}
