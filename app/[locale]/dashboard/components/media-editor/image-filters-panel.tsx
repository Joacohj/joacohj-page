"use client"

import { Button } from "@/components/ui/button"
import { FILTER_PRESETS, type FilterPreset } from "./media-editor-utils"

interface ImageFiltersPanelProps {
  value: FilterPreset
  onChange: (preset: FilterPreset) => void
}

export function ImageFiltersPanel({ value, onChange }: ImageFiltersPanelProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTER_PRESETS.map((preset) => (
        <Button
          key={preset.id}
          type="button"
          size="sm"
          variant={value === preset.id ? "secondary" : "outline"}
          aria-pressed={value === preset.id}
          onClick={() => onChange(preset.id)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
