import mediaOptimizer, { OptimizedFile } from "@/lib/media/media-optimizer";

import { prisma } from "@/lib/prisma";

import { FileSize } from "@/hooks/utils/constants";

import { unstable_cache } from "next/cache";

import { UTFile, UTApi } from "uploadthing/server";
import { generateThumbnailFromVideo } from "@/lib/media/video/media-thumbnails";


// ============================================================
// TYPES
// ============================================================

export type MediaInput =
  | {
      type: "image" | "video";
      file: File;
      width: number;
      height: number;
      aspectRatio: number;
      alt?: string;
      poster?: string;
      order: number;
    }
  | {
      type: "youtube";
      url: string;
      videoId: string;
      order: number;
    };

type CreatePostInput = {
  userId: string;
  title: string;
  visibility: "public" | "private";
  allowInteractions: "all" | "none";
  description: string;
  categoryId: string;
  topicIds: string[];
  media: MediaInput[];
};

type UploadFileInput = {
  file: File;
  category: string;
  postId: string;
  order: number;
  type?: "media" | "thumbnail";
};


// ============================================================
// UPLOADTHING
// ============================================================

const utapi = new UTApi();


function getSafeCategory(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


function getFileExtension(file: File) {
  return file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
}


export async function UploadFiles(files: UploadFileInput[]) {
  const uploadFiles = files.map(
    ({ file, category, postId, order, type = "media" }) => {

      const safeCategory = getSafeCategory(category);

      const extension = getFileExtension(file);

      const customId =
        type === "thumbnail"
          ? `${safeCategory}/${postId}/thumbnails/${order}${extension}`
          : `${safeCategory}/${postId}/${order}${extension}`;

      return new UTFile([file], file.name, {
        type: file.type,
        customId,
      });
    }
  );

  return utapi.uploadFiles(uploadFiles, {
    contentDisposition: "inline",
    concurrency: 5,
  });
}


// ============================================================
// GET POSTS
// ============================================================

export async function getPosts(
  cursor: string | null,
  limit: number
) {
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
    }
  );

  return getCachedPosts();
}


export async function getPublicPosts(
  cursor: string | null,
  limit: number
) {
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
    }
  );

  return getCachedPosts();
}


export async function getPublicPost(postId: string) {
  const getCachedPost = unstable_cache(
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

    ["gallery-post", postId],

    {
      revalidate: 60,
    }
  );

  return getCachedPost();
}


// ============================================================
// MEDIA HELPERS
// ============================================================

type LocalMedia = Extract<
  MediaInput,
  {
    type: "image" | "video";
  }
>;


function getLocalMedia(media: MediaInput[]) {
  return media.filter(
    (item): item is LocalMedia =>
      item.type === "image" ||
      item.type === "video"
  );
}


// ============================================================
// OPTIMIZE MEDIA
// ============================================================

async function optimizeMediaFiles(
  media: LocalMedia[],
  size: FileSize
) {
  const files = media.map((item) => item.file);

  return mediaOptimizer(files, size);
}


// ============================================================
// GENERATE VIDEO THUMBNAILS
// ============================================================

async function generateVideoThumbnails(
  media: LocalMedia[],
  optimizedMedia: Awaited<
    ReturnType<typeof mediaOptimizer>
  >
) {
  return Promise.all(
    optimizedMedia.map(async (optimized, index) => {
      const original = media[index];

      if (original.type !== "video") {
        return null;
      }

      return generateThumbnailFromVideo(
        optimized.file
      );
    })
  );
}


// ============================================================
// PREPARE MEDIA UPLOADS
// ============================================================

function prepareMediaUploads(
  media: LocalMedia[],
  optimizedMedia: Awaited<
    ReturnType<typeof mediaOptimizer>
  >,
  category: string,
  postId: string
): UploadFileInput[] {

  return optimizedMedia.map((optimized, index) => ({
    file: optimized.file,

    category,

    postId,

    order: media[index].order,

    type: "media",
  }));
}


// ============================================================
// PREPARE THUMBNAIL UPLOADS
// ============================================================

function prepareThumbnailUploads(
  media: LocalMedia[],
  thumbnails: (OptimizedFile | null | undefined)[],
  category: string,
  postId: string
): UploadFileInput[] {

  return thumbnails.flatMap((thumbnail, index) => {

    if (!thumbnail) {
      return [];
    }

    return [
      {
        file: thumbnail.file,

        category,

        postId,

        order: media[index].order,

        type: "thumbnail" as const,
      },
    ];
  });
}


// ============================================================
// VALIDATE UPLOADS
// ============================================================

function validateUploads(
  uploads: Awaited<ReturnType<typeof UploadFiles>>
) {
  const failed = uploads.some(
    (file) => file.error !== null
  );

  if (failed) {
    throw new Error(
      "Failed to upload one or more files"
    );
  }
}


// ============================================================
// FIND UPLOADED FILE
// ============================================================

function getUploadedFile(
  media: LocalMedia,
  uploadedFiles: Awaited<
    ReturnType<typeof UploadFiles>
  >,
  fileMedia: LocalMedia[]
) {

  const index = fileMedia.findIndex(
    (file) => file.order === media.order
  );

  if (index === -1) {
    throw new Error(
      `File not found for media order ${media.order}`
    );
  }

  const uploaded = uploadedFiles[index];

  if (!uploaded?.data) {
    throw new Error(
      `Upload failed for media order ${media.order}`
    );
  }

  return uploaded;
}


// ============================================================
// FIND UPLOADED THUMBNAIL
// ============================================================

function getUploadedThumbnail(
  media: LocalMedia,
  uploadedThumbnails: Awaited<
    ReturnType<typeof UploadFiles>
  >,
  thumbnailUploads: UploadFileInput[]
) {

  const index = thumbnailUploads.findIndex(
    (thumbnail) =>
      thumbnail.order === media.order
  );

  if (index === -1) {
    return null;
  }

  return uploadedThumbnails[index]?.data?.ufsUrl ?? null;
}


// ============================================================
// CREATE PRISMA MEDIA
// ============================================================

function createMediaData(
  media: MediaInput,
  fileMedia: LocalMedia[],
  uploadedFiles: Awaited<
    ReturnType<typeof UploadFiles>
  >,
  uploadedThumbnails: Awaited<
    ReturnType<typeof UploadFiles>
  >,
  thumbnailUploads: UploadFileInput[]
) {

  // ----------------------------------------------------------
  // YOUTUBE
  // ----------------------------------------------------------

  if (media.type === "youtube") {
    return {
      kind: "youtube" as const,

      videoId: media.videoId,

      order: media.order,
    };
  }


  // ----------------------------------------------------------
  // LOCAL FILE
  // ----------------------------------------------------------

  const uploaded = getUploadedFile(
    media,
    uploadedFiles,
    fileMedia
  );


  // ----------------------------------------------------------
  // THUMBNAIL
  // ----------------------------------------------------------

  const generatedThumbnail =
    getUploadedThumbnail(
      media,
      uploadedThumbnails,
      thumbnailUploads
    );


  /**
   * Priority:
   *
   * 1. Poster enviado manualmente
   * 2. Thumbnail generado automáticamente
   * 3. null
   */
  const poster =
    media.poster ??
    generatedThumbnail ??
    null;


  return {
    kind: media.type,

    width: media.width,

    height: media.height,

    aspectRatio: media.aspectRatio,

    alt: media.alt,

    poster,

    src: uploaded.data.ufsUrl,

    order: media.order,
  };
}


// ============================================================
// CREATE POST
// ============================================================

export async function createPost(
  data: CreatePostInput,
  size: FileSize = "small"
) {

  const postId = crypto.randomUUID();


  try {

    // ========================================================
    // 1. LOCAL MEDIA
    // ========================================================

    const fileMedia = getLocalMedia(
      data.media
    );


    // ========================================================
    // 2. OPTIMIZE
    // ========================================================

    const optimizedMedia =
      await optimizeMediaFiles(
        fileMedia,
        size
      );


    // ========================================================
    // 3. GENERATE THUMBNAILS
    // ========================================================

    const thumbnails =
      await generateVideoThumbnails(
        fileMedia,
        optimizedMedia
      );


    // ========================================================
    // 4. PREPARE UPLOADS
    // ========================================================

    const mediaUploads =
      prepareMediaUploads(
        fileMedia,
        optimizedMedia,
        data.categoryId,
        postId
      );


    const thumbnailUploads =
      prepareThumbnailUploads(
        fileMedia,
        thumbnails,
        data.categoryId,
        postId
      );


    // ========================================================
    // 5. UPLOAD MEDIA
    // ========================================================

    const uploadedFiles =
      await UploadFiles(
        mediaUploads
      );

    validateUploads(
      uploadedFiles
    );


    // ========================================================
    // 6. UPLOAD THUMBNAILS
    // ========================================================

    const uploadedThumbnails =
      thumbnailUploads.length > 0
        ? await UploadFiles(
            thumbnailUploads
          )
        : [];


    if (thumbnailUploads.length > 0) {
      validateUploads(
        uploadedThumbnails
      );
    }


    // ========================================================
    // 7. CREATE POST
    // ========================================================

    return await prisma.$transaction(
      async (tx) => {

        const post =
          await tx.post.create({

            data: {

              id: postId,

              userId: data.userId,

              title: data.title,

              description: data.description,

              visibility: data.visibility,

              allowInteractions:
                data.allowInteractions,

              categoryId:
                data.categoryId,


              // ----------------------------------------------
              // TOPICS
              // ----------------------------------------------

              topics: {

                connect:
                  data.topicIds.map(
                    (id) => ({
                      id,
                    })
                  ),
              },


              // ----------------------------------------------
              // MEDIA
              // ----------------------------------------------

              media: {

                create: data.media.map(
                  (media) =>
                    createMediaData(
                      media,

                      fileMedia,

                      uploadedFiles,

                      uploadedThumbnails,

                      thumbnailUploads
                    )
                ),
              },
            },


            // ----------------------------------------------
            // INCLUDE
            // ----------------------------------------------

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


        return post;
      }
    );

  } catch (error) {

    console.error(
      "createPost error:",
      error
    );

    throw error;
  }
}