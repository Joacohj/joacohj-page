"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { MAX_IMAGE_SIZE } from "@/hooks/utils/constants";
type EmptyDemo = {
    file: File | undefined | null,
    setFile: (file: File | null) => void
}
export function EmptyDemo({file, setFile}: EmptyDemo) {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {setFile(image)}, [image])
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        if (!file) return;

        setImage(file);

        const previewUrl = URL.createObjectURL(file);
        setPreview((oldPreview) => {
            if (oldPreview) {
                URL.revokeObjectURL(oldPreview);
            }

            return previewUrl;
        });
    }, []);

    const { getRootProps, inputRef, getInputProps, isDragActive, open } = useDropzone({
        validator: (file) => {
            if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
                return {
                    code: "image-too-large",
                    message: "Las imágenes no pueden superar los 5 MB.",
                };
            }
            return null;
        },
        onDrop,
        accept: {
            "image/*": [".jpg", ".jpeg", ".png", ".webp"],
        },
        maxFiles: 1,
        multiple: false,
        noClick: true,
    });

    const handleRemove = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setImage(null);
        setPreview(null);
    };

    if (image && preview) {
        return (
            <div className="relative w-full overflow-hidden rounded-lg border">
                <img
                    src={preview}
                    alt="Selected image"
                    className="h-64 w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                    <p className="max-w-[70%] truncate text-sm text-white">
                        {image.name}
                    </p>

                    <div className="flex gap-2">

                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemove}
                        >
                            <X />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`w-full rounded-lg border border-dashed border-input transition-colors ${isDragActive ? "border-primary bg-muted/50" : ""
                }`}
        >
            <input {...getInputProps()} />

            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        {isDragActive ? <Upload /> : <ImageIcon />}
                    </EmptyMedia>

                    <EmptyTitle>
                        {isDragActive
                            ? "Drop your image here"
                            : "Import Image or Drag & Drop One"}
                    </EmptyTitle>

                    <EmptyDescription>
                        You haven&apos;t uploaded any images yet. Get started by uploading
                        the banner image.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent className="flex-row justify-center gap-2">
                    <Button
                        type="button"
                        onClick={open}
                    >
                        Import Image
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}