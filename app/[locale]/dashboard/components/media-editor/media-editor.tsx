"use client"

import * as React from "react"

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TooltipProvider } from "@/components/ui/tooltip"



import { ImageEditor } from "./image-editor"
import { VideoEditor } from "./video-editor"
import { detectMediaType } from "./media-editor-utils"

export interface MediaEditorProps {
  file: File
  onSave: (file: File, blob: Blob) => void
  onCancel?: () => void,
  originalFile: File
}


/**
 * MediaEditor is designed to be dropped straight inside a shadcn
 * `<DialogContent>`. It renders the dialog title/description and delegates to
 * the correct editor based on the file's media type. For the best experience,
 * give the surrounding `DialogContent` a larger width and height, e.g.
 * `className="flex h-[85vh] max-h-[720px] w-full max-w-3xl flex-col"`.
 */
export function MediaEditor({ file, onSave, onCancel, originalFile }: MediaEditorProps) {
  const mediaType = detectMediaType(file)

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Edit media</DialogTitle>
          <DialogDescription className="truncate">
            {file.name}
          </DialogDescription>
        </DialogHeader>

        {mediaType === "image" && (
          <ImageEditor file={file} onSave={onSave} onCancel={onCancel} />
        )}
        {mediaType === "video" && (
          <VideoEditor file={file} onSave={onSave} onCancel={onCancel} />
        )}
        {mediaType === "unsupported" && (
          <div className="flex min-h-[200px] flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            This file type can&apos;t be edited. Please choose an image or video.
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
