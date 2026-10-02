import { FileSize } from "@/hooks/utils/constants";
import { imageOptimizer } from "@/lib/media/images/image-optimizer";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { UTApi, UTFile } from "uploadthing/server";



export async function getBlogPosts() {
  const getCachedBlogPosts = unstable_cache(async () => {
    return prisma.blogPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  return getCachedBlogPosts();
}


export async function getPublicBlogPosts(  cursor: string | null,
  limit: number) {
 const getCachedPosts = unstable_cache(
    async () => {
      return prisma.blogPost.findMany({
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
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          category: true,
          topics: true,

        },
      });
    },

    ["blog-posts", cursor ?? "first-page", String(limit)],

    {
      revalidate: 60,
    }
  );

  return getCachedPosts();
}

type CreatePostInput = {
  userId: string;
  title: string;
  visibility: "public" | "private";
  allowInteractions: "all" | "none";
  description: string;
  categoryId: string;
  topicIds: string[];
  content: string;
  banner: MediaInput;
  contentImages: {
    file: File;
    node: LexicalNode;
  }[];
};

type MediaInput = {
  file: File;
  alt: string;
};

export type LexicalNode = {
  type?: string;
  src?: string;
  altText?: string;
  width?: number | null;
  height?: number | null;
  children?: LexicalNode[];
};

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

type UploadFileInput = {
  file: File;
  category: string;
  postId: string;
};

const utapi = new UTApi();

async function uploadFiles(files: UploadFileInput[]) {
  const uploadFiles = files.map(({ file, category, postId }) => {
    const safeCategory = getSafeCategory(category);
    const extension = getFileExtension(file);

    const customId = `${safeCategory}/${postId}/${crypto.randomUUID()}${extension}`;

    return new UTFile([file], file.name, {
      type: file.type,
      customId,
    });
  });

  return utapi.uploadFiles(uploadFiles, {
    contentDisposition: "inline",
    concurrency: 5,
  });
}

function replaceImageSources(
  node: LexicalNode,
  uploadedMedia: {
    src: string;
    url: string;
  }[],
) {
  if (node.type === "image" && node.src) {
    const uploaded = uploadedMedia.find((media) => media.src === node.src);

    if (uploaded) {
      node.src = uploaded.url;
    }
  }

  if (node.children) {
    for (const child of node.children) {
      replaceImageSources(child, uploadedMedia);
    }
  }
}

export async function createBlogPost(
  data: CreatePostInput,
  size: FileSize = "medium",
) {
  try {
    const postId = crypto.randomUUID();

    // ─────────────────────────────
    // 1. Parsear Lexical
    // ─────────────────────────────

    const content = JSON.parse(data.content);

    // ─────────────────────────────
    // 2. Optimizar banner
    // ─────────────────────────────

    const optimizedBanner = await imageOptimizer(data.banner.file);

    // ─────────────────────────────
    // 3. Optimizar imágenes del contenido
    // ─────────────────────────────

    const optimizedImages = await Promise.all(
      data.contentImages.map(async ({ node, file }) => {
        const optimized = await imageOptimizer(file);

        return {
          node,
          optimized,
        };
      }),
    );

    // ─────────────────────────────
    // 4. Subir banner
    // ─────────────────────────────

    const [bannerResult] = await uploadFiles([
      {
        file: optimizedBanner.file,
        category: "blog/banner",
        postId,
      },
    ]);

    if (!bannerResult?.data?.ufsUrl) {
      throw new Error("Failed to upload banner");
    }

    const bannerUrl = bannerResult.data.ufsUrl;

    // ─────────────────────────────
    // 5. Subir imágenes del contenido
    // ─────────────────────────────

    const imageResults = await uploadFiles(
      optimizedImages.map(({ optimized }) => ({
        file: optimized.file,
        category: "blog/content",
        postId,
      })),
    );

    // ─────────────────────────────
    // 6. Crear relación
    //    blob URL → UploadThing URL
    // ─────────────────────────────

    const uploadedMedia = optimizedImages.map(({ node }, index) => {
      const result = imageResults[index];

      if (!result?.data?.ufsUrl) {
        throw new Error(
          `Failed to upload image: ${node.altText ?? "unknown image"}`,
        );
      }

      return {
        src: node.src!,
        url: result.data.ufsUrl,
      };
    });

    // ─────────────────────────────
    // 7. Reemplazar blob URLs
    // ─────────────────────────────

    replaceImageSources(content.root, uploadedMedia);

    // ─────────────────────────────
    // 8. JSON final
    // ─────────────────────────────

    const finalContent = JSON.stringify(content);

    console.log("Banner:", bannerUrl);
    console.log("Content:", finalContent);

    // ─────────────────────────────
    // 9. Prisma
    // ─────────────────────────────

    const post = await prisma.$transaction(async (tx) => {
      const post = await tx.blogPost.create({
        data: {
          id: postId,
          userId: data.userId,
          title: data.title,
          description: data.description,
          visibility: data.visibility,
          allowInteractions: data.allowInteractions,
          categoryId: data.categoryId,
          content,
          banner: bannerUrl,
        },
      });

      if (uploadedMedia.length > 0) {
        await tx.media.createMany({
          data: uploadedMedia.map(({ url }, index) => ({
            src: url,
            alt: data.contentImages[index]?.node.altText ?? null,
            blogPostId: post.id,
            order: index,
          })),
        });
      }

      return post;
    });
    console.log(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
}
