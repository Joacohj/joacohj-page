"use client"

import { RotateCcw, RotateCw, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "./media-editor-utils"

interface ImageEditPanelProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onReset: () => void
}

export function ImageEditPanel({
  zoom,
  onZoomChange,
  onRotateLeft,
  onRotateRight,
  onReset,
}: ImageEditPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="zoom-slider">Zoom</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {zoom.toFixed(1)}x
          </span>
        </div>
        <Slider
          id="zoom-slider"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={ZOOM_STEP}
          value={zoom}
          onValueChange={(value) =>
            onZoomChange(Array.isArray(value) ? value[0] : value)
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Label>Rotation</Label>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Rotate left"
                    onClick={onRotateLeft}
                  >
                    <RotateCcw />
                  </Button>
                }
              />
              <TooltipContent>Rotate left</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Rotate right"
                    onClick={onRotateRight}
                  >
                    <RotateCw />
                  </Button>
                }
              />
              <TooltipContent>Rotate right</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <Undo2 data-icon="inline-start" />
          Reset
        </Button>
      </div>
    </div>
  )
}
