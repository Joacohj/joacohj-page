import { z } from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// export const mediaSchema = z.array(
//   z.discriminatedUnion("type", [
//     z.object({
//       type: z.enum(["image", "video"]),
//       file: z.instanceof(File),
//       width: z.number(),
//       height: z.number(),
//       aspectRatio: z.number(),
//       alt: z.string(),
//       poster: z.string().optional(),
//       order: z.number(),
//     }),

//     z.object({
//       type: z.literal("youtube"),
//       url: z.string().url(),
//       videoId: z.string().min(1),
//       order: z.number(),
//     }),
//   ]),
// );
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "El título es demasiado largo"),
  description: z.string().max(500, "La descripción es demasiado larga"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  topicIds: z.array(z.string()).min(1, "Selecciona al menos un topic"),
  visibility: z.enum(["public", "private"]),
  allowInteractions: z.enum(["all", "none"]),
  fileSize: z.enum(["small", "medium", "large"]),
});
export type CreatePostFormValues = z.infer<typeof createPostSchema>;
