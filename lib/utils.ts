import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type MediaMetadata = {
  width: number;
  height: number;
  aspectRatio: number;
  poster?: string;
};

export async function getMediaMetadata(
  file: File
): Promise<MediaMetadata> {
  if (file.type.startsWith("image/")) {
    const url = URL.createObjectURL(file);

    try {
      const image = new Image();

      image.src = url;

      await image.decode();

      return {
        width: image.naturalWidth,
        height: image.naturalHeight,
        aspectRatio:
          image.naturalWidth / image.naturalHeight,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  if (file.type.startsWith("video/")) {
    const url = URL.createObjectURL(file);

    try {
      const video = document.createElement("video");

      video.preload = "metadata";
      video.src = url;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () =>
          reject(
            new Error(
              `No se pudo obtener metadata de "${file.name}".`
            )
          );
      });

      return {
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio:
          video.videoWidth / video.videoHeight,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  throw new Error(`Tipo de archivo no soportado: ${file.type}`);
}
