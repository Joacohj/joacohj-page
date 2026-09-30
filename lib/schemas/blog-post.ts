import z from "zod";

export const createBlogPostSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(100, "El título es demasiado largo"),
  description: z.string().max(500, "La descripción es demasiado larga"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  topicIds: z.array(z.string()).min(1, "Selecciona al menos un topic"),
  visibility: z.enum(["public", "private"]),
  allowInteractions: z.enum(["all", "none"]),
});
export type CreateBlogPostFormValues = z.infer<typeof createBlogPostSchema>;
