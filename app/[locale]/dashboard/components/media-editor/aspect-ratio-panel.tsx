"use client"

import { Button } from "@/components/ui/button"
import { ASPECT_RATIOS, type AspectRatioPreset } from "./media-editor-utils"

interface AspectRatioPanelProps {
  value: AspectRatioPreset
  onChange: (preset: AspectRatioPreset) => void
}

export function AspectRatioPanel({ value, onChange }: AspectRatioPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {ASPECT_RATIOS.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={value === option.id ? "secondary" : "outline"}
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        The frame defines the export crop — zoom, move or rotate the image
        behind it to choose what stays in view.
      </p>
    </div>
  )
}
