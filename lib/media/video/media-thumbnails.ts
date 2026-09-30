import { execa } from "execa";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { imageOptimizer } from "../images/image-optimizer";
export async function generateThumbnailFromVideo(file: File) {
  if (!file.type.startsWith("video/")) return;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "thumbnail-"));
  const inputPath = path.join(tempDir, "input");
  const outputPath = path.join(tempDir, "output.webp");
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);
    await execa("ffmpeg", [
      "-ss",
      "0.1",
      "-i",
      inputPath,
      "-frames:v",
      "1",
      outputPath,
    ]);

    const thumbnailBuffer = await fs.readFile(outputPath);

    const thumbnailImage = new File(
      [thumbnailBuffer],
      `${file.name}-thumbnail.png`,
      { type: "image/png" },
    );


    const optimizedThumbnailImage = await imageOptimizer(
      thumbnailImage,
      "thumbnail",
    );

    return optimizedThumbnailImage;
  } catch (error) {
    throw error;
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
}
