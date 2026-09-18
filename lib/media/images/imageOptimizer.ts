import sharp from "sharp";
import type { OptimizedFile } from "../mediaOptimizer";
import { FileSize } from "@/utils/constants";
export async function imagesOptimizer(files: File[]) {
  const arrayBuffers = await Promise.all(
    files.map((file) => file.arrayBuffer()),
  );
  const buffers = arrayBuffers.map((arrayBuffer) => Buffer.from(arrayBuffer));
  try {
    const output = await Promise.all(
      buffers.map((buffer, i) =>
        sharp(buffer)
          .resize({
            width: 1920,
            height: 1920,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82 })
          .toBuffer()
          .then((optimizedBuffer) => {
            const optimizedFile = new File(
              [optimizedBuffer],
              `${files[i].name.replace(/\.[^/.]+$/, "")}.webp`,
              { type: "image/webp" },
            );
            const compressionPercentage =
              ((files[i].size - optimizedFile.size) / files[i].size) * 100;
            return {
              file: optimizedFile,
              originalSize: files[i].size,
              optimizedSize: optimizedFile.size,
              compressionPercentage:
                Math.round(compressionPercentage * 100) / 100,
            };
          }),
      ),
    );
    return output;
  } catch (error) {
    throw error;
  }
}

export async function imageOptimizer(
  file: File,
  size: FileSize = "small",
): Promise<OptimizedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const settings = {
    small: { width: 1280, height: 1280, quality: 70 },
    medium: { width: 1920, height: 1920, quality: 82 },
    large: { width: 2560, height: 2560, quality: 90 },
  }[size];
  try {
    const output = await sharp(buffer)
      .resize({
        width: settings.width,
        height: settings.height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: settings.quality })
      .toBuffer();
    const optimizedFile = new File(
      [output],
      `${file.name.replace(/\.[^/.]+$/, "")}.webp`,
      { type: "image/webp" },
    );
    if (size === "large" && optimizedFile.size >= file.size) {
      return {
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionPercentage: 0,
      };
    }
    const compressionPercentage =
      ((file.size - optimizedFile.size) / file.size) * 100;
    return {
      file: optimizedFile,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      compressionPercentage: Math.round(compressionPercentage * 100) / 100,
    };
  } catch (error) {
    throw error;
  }
}
