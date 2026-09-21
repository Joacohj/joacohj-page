
import mediaOptimizer from "@/lib/media/media-optimizer";
import { prisma } from "@/lib/prisma";
import { FileSize } from "@/hooks/utils/constants";
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

export async function getPublicPosts(cursor: string | null, limit: number) {
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

export async function getPublicPost(postId: string) {
  const getCachedPosts = unstable_cache(
    async () => {
      return prisma.post.findFirst({
        where: {
          id: postId,
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

    ["gallery-posts"],

    {
      revalidate: 60,
    },
  );

  return getCachedPosts();
}

export type MediaInput =
  | {
    type: "image" | "video"
    file: File
    width: number
    height: number
    aspectRatio: number
    alt?: string
    poster?: string
    order: number
  }
  | {
    type: "youtube"
    url: string
    videoId: string
    order: number
  }
type CreatePostInput = {
    userId: string
    title: string
    visibility: "public" | "private"
    allowInteractions: "all" | "none"
    description: string
    categoryId: string
    topicIds: string[]
    media: MediaInput[]
}
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
    const postId = crypto.randomUUID()

    try {
        /*
         * ==========================
         * ARCHIVOS LOCALES
         * ==========================
         */

        const fileMedia = data.media.filter(
            (
                media,
            ): media is Extract<
                MediaInput,
                { type: "image" | "video" }
            > => media.type === "image" || media.type === "video"
        )

        const optimizedMedia = await mediaOptimizer(
            fileMedia.map((media) => media.file),
            size,
        )

        /*
         * ==========================
         * UPLOADTHING
         * ==========================
         */

        const uploadedFiles = await UploadFiles(
            optimizedMedia.map((optimized, index) => ({
                file: optimized.file,
                category: data.categoryId,
                postId,
                order: fileMedia[index].order,
            })),
        )

        const failed = uploadedFiles.some(
            (file) => file.error !== null
        )

        if (failed) {
            throw new Error(
                "Failed to upload one or more files"
            )
        }

        /*
         * ==========================
         * CREAR POST
         * ==========================
         */

        return await prisma.$transaction(async (tx) => {
            const post = await tx.post.create({
                data: {
                    id: postId,
                    userId: data.userId,
                    title: data.title,
                    description: data.description,
                    visibility: data.visibility,
                    allowInteractions: data.allowInteractions,
                    categoryId: data.categoryId,

                    topics: {
                        connect: data.topicIds.map((id) => ({
                            id,
                        })),
                    },

                    media: {
                        create: data.media.map((media) => {
                            /*
                             * ==========================
                             * YOUTUBE
                             * ==========================
                             */

                            if (media.type === "youtube") {
                                return {
                                    kind: "youtube",
                                    videoId: media.videoId,
                                    order: media.order,
                                }
                            }

                            /*
                             * ==========================
                             * ARCHIVO LOCAL
                             * ==========================
                             */

                            const fileIndex = fileMedia.findIndex(
                                (file) =>
                                    file.order === media.order
                            )

                            if (fileIndex === -1) {
                                throw new Error(
                                    `File not found for media order ${media.order}`
                                )
                            }

                            const uploaded =
                                uploadedFiles[fileIndex]

                            if (!uploaded.data) {
                                throw new Error(
                                    `Upload failed for media order ${media.order}`
                                )
                            }

                            return {
                                kind: media.type,
                                width: media.width,
                                height: media.height,
                                aspectRatio: media.aspectRatio,
                                alt: media.alt,
                                poster: media.poster,
                                src: uploaded.data.ufsUrl,
                                order: media.order,
                            }
                        }),
                    },
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
            })

            return post
        })
    } catch (error) {
        console.error("createPost error:", error)
        throw error
    }
}