import mediaOptimizer from "@/lib/media/mediaOptimizer";
import { prisma } from "@/lib/prisma";
import { FileSize } from "@/utils/constants";
import { unstable_cache } from "next/cache";
import { UTFile, UTApi } from "uploadthing/server";
export async function getPosts(cursor: string | null, limit: number) {
  const getCachedPosts = unstable_cache(
    async () => {
      return prisma.post.findMany({
        take: limit + 1,

        ...(cursor
          ? {
              skip: 1,
              cursor: {
                id: cursor,
              },
            }
          : {}),

        where: {
          visibility: "public",
          media: {
            some: {},
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          category: true,
          topics: true,
          media: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    },

    ["gallery-posts", cursor ?? "first-page", String(limit)],

    {
      revalidate: 60,
    },
  );

  return getCachedPosts();
}

export type MediaInput = {
  file: File;
  width: number;
  height: number;
  aspectRatio: number;
  alt?: string;
  poster?: string;
  kind: "image" | "video";
  order: number;
};
type CreatePostInput = {
  userId: string;
  title: string;
  description: string;
  categoryId: string;
  topicIds: string[];
  media: MediaInput[];
};

const utapi = new UTApi();

type UploadFileInput = {
  file: File;
  category: string;
  postId: string;
  order: number;
};

export async function UploadFiles(files: UploadFileInput[]) {
  const uploadFiles = files.map(({ file, category, postId, order }) => {
    const safeCategory = category
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const extension = file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf("."))
      : "";

    const customId = `${safeCategory}/${postId}/${order}${extension}`;

    return new UTFile([file], file.name, {
      type: file.type,
      customId,
    });
  });

  const response = await utapi.uploadFiles(uploadFiles, {
    contentDisposition: "inline",
    concurrency: 5,
  });
  return response;
}

export async function createPost(
  data: CreatePostInput,
  size: FileSize = "small",
) {
  try {
    const postId = crypto.randomUUID();
    const optimizedMedia = await mediaOptimizer(
      data.media.map((media) => media.file),
      size,
    );
    const uploadedFiles = await UploadFiles(
      optimizedMedia.map((optimized, index) => ({
        file: optimized.file,
        category: data.categoryId,
        postId,
        order: data.media[index].order,
      })),
    );
    const failed = uploadedFiles.some((file) => file.error !== null);
    if (failed) {
      throw new Error("Failed to upload one or more files");
    }
    return await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          id: postId,
          userId: data.userId,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          topics: { connect: data.topicIds.map((id) => ({ id })) },
          media: {
            create: data.media.map((media, index) => ({
              width: media.width,
              height: media.height,
              aspectRatio: media.aspectRatio,
              alt: media.alt,
              src: uploadedFiles[index].data!.ufsUrl,
              kind: media.kind,
              order: media.order,
            })),
          },
        },
        include: {
          category: true,
          topics: true,
          media: { orderBy: { order: "asc" } },
        },
      });
      return post;
    });
  } catch (error) {
    throw error;
  }
}
