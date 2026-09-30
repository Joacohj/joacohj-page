"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createBlogPost, LexicalNode } from "@/services/blog/blog.service";
import { createBlogPostSchema } from "@/lib/schemas/blog-post";

export type PostInput = {
  allowInteractions: "none" | "all";
  visibility: "public" | "private";
  userId: string | undefined;
  title: string;
  description: string;
  categoryId: string;
  content: string;
  topicIds: string[];
  banner: {
    file: File;
    alt: string;
  };
  contentImages: {
    file: File;
    node: LexicalNode;
  }[];
};

export async function create(post: PostInput) {
  console.log("hello world");
  const postResult = createBlogPostSchema.safeParse(post);

  if (!postResult.success) {
    return {
      success: false,
      errors: postResult.error.flatten().fieldErrors,
    };
  }

  const data = postResult.data;
  console.log(post.contentImages);
  await createBlogPost(
    {
      categoryId: data.categoryId,
      userId: post.userId ?? "",
      description: data.description,
      content: post.content,
      title: data.title,
      topicIds: data.topicIds,
      visibility: data.visibility,
      contentImages: post.contentImages,
      allowInteractions: data.allowInteractions,
      banner: post.banner,
    },
    "medium",
  );

  revalidatePath("/en/dashboard/overview");
  revalidatePath("/en/");
  return redirect("/en/dashboard/overview");
}
