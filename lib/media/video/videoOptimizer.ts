import { execa } from "execa";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { OptimizedFile } from "../mediaOptimizer";
import { FileSize } from "@/utils/constants";

export async function compressVideo(
    file: File,
    size: FileSize = "small",
): Promise<OptimizedFile> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "video-"));
    const inputPath = path.join(tempDir, "input");
    const outputPath = path.join(tempDir, "output.mp4");
    const settings = {
        small: { height: "720", crf: "32", audioBitrate: "96k", preset: "medium" },
        medium: {
            height: "1080",
            crf: "28",
            audioBitrate: "128k",
            preset: "medium",
        },
        large: { height: "1080", crf: "24", audioBitrate: "192k", preset: "slow" },
    }[size];
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(inputPath, buffer);
        await execa("ffmpeg", [
            "-i",
            inputPath,
            "-vf",
            `scale=-2:${settings.height}`,
            "-c:v",
            "libx264",
            "-crf",
            settings.crf,
            "-preset",
            settings.preset,
            "-c:a",
            "aac",
            "-b:a",
            settings.audioBitrate,
            "-movflags",
            "+faststart",
            "-y",
            outputPath,
        ]);
        const output = await fs.readFile(outputPath);
        const optimizedFile = new File(
            [output],
            `${file.name.replace(/\.[^/.]+$/, "")}.mp4`,
            { type: "video/mp4" },
        );
        if (size === "large" && optimizedFile.size >= file.size) {
            return {
                file,
                originalSize: file.size,
                optimizedSize: file.size,
                compressionPercentage: 0,
            };
        }
        if (size === "medium" && optimizedFile.size >= file.size) {
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
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}
