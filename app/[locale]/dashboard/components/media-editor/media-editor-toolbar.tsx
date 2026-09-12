"use client"

import {
  SlidersHorizontal,
  Wand2,
  Type,
  Crop,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export type EditorTool = "filters" | "edit" | "text" | "aspect"

interface ToolDefinition {
  id: EditorTool
  label: string
  icon: LucideIcon
}

const TOOLS: ToolDefinition[] = [
  { id: "filters", label: "Filters", icon: Wand2 },
  { id: "edit", label: "Edit", icon: SlidersHorizontal },
  { id: "text", label: "Text", icon: Type },
  { id: "aspect", label: "Aspect ratio", icon: Crop },
]

interface MediaEditorToolbarProps {
  activeTool: EditorTool
  onToolChange: (tool: EditorTool) => void
}

export function MediaEditorToolbar({
  activeTool,
  onToolChange,
}: MediaEditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {TOOLS.map((tool) => {
        const Icon = tool.icon
        const active = activeTool === tool.id
        return (
          <Button
            key={tool.id}
            type="button"
            size="sm"
            variant={active ? "secondary" : "ghost"}
            aria-pressed={active}
            onClick={() => onToolChange(tool.id)}
          >
            <Icon data-icon="inline-start" />
            {tool.label}
          </Button>
        )
      })}
    </div>
  )
}
