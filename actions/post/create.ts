"use server"

import { createPost as createPostService } from "@/services"
import {
    createPostSchema,
} from "@/lib/schemas/post"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"



export type PostInput = {
    allowInteractions: "none" | "all";
    visibility: "public" | "private";
    fileSize: "small" | "large" | "medium";
    userId: string | undefined;
    title: string;
    description: string;
    categoryId: string;
    topicIds: string[];
    media: ({
        type: "youtube";
        url: string;
        videoId: string;
        order: number;
    } | {
        poster?: string | undefined;
        type: "video" | "image";
        file: File;
        width: number;
        height: number;
        aspectRatio: number;
        alt: string;
        order: number;
        url?: undefined;
        videoId?: undefined;
    })[];
}

export async function createPost(post: PostInput) {
    console.log("hello world")

    // Validar post
    const postResult = createPostSchema.safeParse(post)

    if (!postResult.success) {
        return {
            success: false,
            errors: postResult.error.flatten().fieldErrors,
        }
    }


    const data = postResult.data

    const dbPost = await createPostService(
        {
            categoryId: data.categoryId,
            userId: post.userId ?? "",
            description: data.description,
            title: data.title,
            topicIds: data.topicIds,
            visibility: data.visibility,
            allowInteractions: data.allowInteractions,
            media: post.media,
            
        },
        data.fileSize
    )

    if (dbPost?.id) {
        revalidatePath("/en/dashboard/feed/gallery/overview")

        redirect("/en/dashboard/feed/gallery/overview")
    }

    return {
        success: true,
    }
}