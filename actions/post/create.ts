'use server'
type PostInput = {
    userId: string | undefined;
    title: string;
    description: string;
    categoryId: string;
    topicIds: string[];
    media: {
        poster?: string | undefined;
        file: File;
        width: number;
        height: number;
        aspectRatio: number;
        alt: string;
        kind: "image" | "video";
        order: number;
    }[];
}

import { createPost as createPostService } from "@/services";
import {CreatePostFormValues, createPostSchema, mediaSchema} from "@/lib/schemas/post"
import { redirect } from "next/navigation";
import { locale } from "next/root-params";
import { revalidatePath, revalidateTag } from "next/cache";
import { MediaInput } from "@/services/post/post.service";
export async function createPost(post: PostInput) {
    console.log('hello world')
    // 1. Validación runtime
    const result1 = createPostSchema.safeParse(post);
    const result2 = mediaSchema.safeParse(post)
    if (!result1.success) {
        return {
            success: false,
            errors: result1.error.flatten().fieldErrors,
        };
    }

    const data1 = result1.data;
    const data2 = result2.data;
    const media: MediaInput[] = post.media.map(media => media as MediaInput)
    const dbPost = await createPostService({categoryId: data1.categoryId, userId: post.userId ?? '', description: data1.description, media, title: data1.title, topicIds: data1.topicIds}, data1.fileSize)
    if(dbPost?.id) {
         revalidatePath("/en/dashboard/feed/gallery/overview")
        return redirect("/en/dashboard/feed/gallery/overview")
    }

    return {
        success: true,
    };
}