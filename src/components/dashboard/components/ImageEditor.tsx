"use client"

import { useEffect, useRef } from "react"
import { Canvas, FabricImage } from "fabric"

interface ImageEditorProps {
    file: File
    onSave: (file: File, blob: Blob) => void
}

export function ImageEditor({
    file,
    onSave,
}: ImageEditorProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = new Canvas(canvasRef.current, {
            width: 600,
            height: 400,
            backgroundColor: "#000",
        })

        fabricRef.current = canvas

        const url = URL.createObjectURL(file)

        FabricImage.fromURL(url).then((image) => {
            const scale = Math.min(
                canvas.width! / image.width!,
                canvas.height! / image.height!
            )

            image.scale(scale)

            image.set({
                left: canvas.width! / 2,
                top: canvas.height! / 2,
                originX: "center",
                originY: "center",
            })

            canvas.add(image)
            canvas.setActiveObject(image)
            canvas.renderAll()
        })

        return () => {
            URL.revokeObjectURL(url)
            canvas.dispose()
            fabricRef.current = null
        }
    }, [file])

    const handleSave = () => {
        const canvas = fabricRef.current

        if (!canvas) return

        canvas.getElement().toBlob(
            (blob) => {
                if (!blob) return

                const editedFile = new File(
                    [blob],
                    file.name,
                    {
                        type: "image/png",
                        lastModified: Date.now(),
                    }
                )

                onSave(editedFile, blob)
            },
            "image/png",
            1
        )
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border">
                <canvas ref={canvasRef} />
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                >
                    Guardar
                </button>
            </div>
        </div>
    )
}