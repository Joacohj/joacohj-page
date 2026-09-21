import { compressVideo } from "./video/video-optimizer";
import { imageOptimizer } from "./images/image-optimizer";
import { FileSize } from "@/hooks/utils/constants";
export type OptimizedFile = {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionPercentage: number;
};
export default async function mediaOptimizer(
  files: File[],
  size: FileSize = "small",
): Promise<OptimizedFile[]> {
  return Promise.all(
    files.map((file) => {
      if (file.type.startsWith("video/")) {
        return compressVideo(file, size);
      }
      if (file.type.startsWith("image/")) {
        return imageOptimizer(file, size);
      }
      return {
        file,
        originalSize: file.size,
        optimizedSize: file.size,
        compressionPercentage: 0,
      };
    }),
  );
}
