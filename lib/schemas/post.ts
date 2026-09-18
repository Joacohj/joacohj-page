import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const mediaSchema = z.object({
  poster: z.string().optional(),

  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "El archivo no puede superar los 5 MB",
    ),

  width: z.number().int().positive(),

  height: z.number().int().positive(),

  aspectRatio: z.number().positive(),

  alt: z.string().trim().min(1, "El alt es obligatorio").max(200),

  kind: z.enum(["image", "video"]),

  order: z.number().int().nonnegative(),
});

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(100, "El título no puede superar los 100 caracteres."),

  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria.")
    .max(1000, "La descripción no puede superar los 1000 caracteres."),

  categoryId: z
    .string()
    .min(1, "Seleccioná una categoría."),

  topicIds: z
    .array(z.string())
    .min(1, "Seleccioná al menos un topic."),

  fileSize: z.enum(["small", "medium", "large"]),

  visibility: z.enum(["public", "private"]),

  allowInteractions: z.enum(["all", "none"]),
});

export type CreatePostFormValues = z.infer<
  typeof createPostSchema
>;