"use client"

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Plus,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  type TextAlign,
  type TextSelection,
} from "./media-editor-utils"

interface ImageTextPanelProps {
  selection: TextSelection | null
  onAddText: () => void
  onUpdate: (props: Partial<TextSelection>) => void
  onRemove: () => void
}

const ALIGNMENTS: { value: TextAlign; label: string; icon: typeof AlignLeft }[] =
  [
    { value: "left", label: "Align left", icon: AlignLeft },
    { value: "center", label: "Align center", icon: AlignCenter },
    { value: "right", label: "Align right", icon: AlignRight },
  ]

export function ImageTextPanel({
  selection,
  onAddText,
  onUpdate,
  onRemove,
}: ImageTextPanelProps) {
  if (!selection) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          Add a text layer, then drag, scale or rotate it directly on the image.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onAddText}>
          <Plus data-icon="inline-start" />
          Add text
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="text-content">Content</Label>
        <Input
          id="text-content"
          value={selection.text}
          onChange={(event) => onUpdate({ text: event.target.value })}
          placeholder="Enter text"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="font-size">Font size</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {selection.fontSize}px
          </span>
        </div>
        <Slider
          id="font-size"
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
          value={selection.fontSize}
          onValueChange={(value) =>
            onUpdate({ fontSize: Array.isArray(value) ? value[0] : value })
          }
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Label>Style</Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={selection.bold ? "secondary" : "outline"}
              size="icon-sm"
              aria-label="Bold"
              aria-pressed={selection.bold}
              onClick={() => onUpdate({ bold: !selection.bold })}
            >
              <Bold />
            </Button>
            <Button
              type="button"
              variant={selection.italic ? "secondary" : "outline"}
              size="icon-sm"
              aria-label="Italic"
              aria-pressed={selection.italic}
              onClick={() => onUpdate({ italic: !selection.italic })}
            >
              <Italic />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Alignment</Label>
          <div className="flex items-center gap-1">
            {ALIGNMENTS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant={selection.align === value ? "secondary" : "outline"}
                size="icon-sm"
                aria-label={label}
                aria-pressed={selection.align === value}
                onClick={() => onUpdate({ align: value })}
              >
                <Icon />
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="text-color">Color</Label>
          <label
            htmlFor="text-color"
            className="flex h-7 cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
          >
            <span
              className="size-4 shrink-0 rounded-full ring-1 ring-foreground/15"
              style={{ backgroundColor: selection.fill }}
            />
            <span className="tabular-nums text-muted-foreground uppercase">
              {selection.fill}
            </span>
            <input
              id="text-color"
              type="color"
              value={selection.fill}
              onChange={(event) => onUpdate({ fill: event.target.value })}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
        >
          <Trash2 data-icon="inline-start" />
          Remove text
        </Button>
      </div>
    </div>
  )
}
