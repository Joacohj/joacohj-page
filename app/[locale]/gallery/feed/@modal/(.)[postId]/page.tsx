import { Dialog, DialogContent } from "@/components/ui/dialog";
import FeedDialog from "@/features/feed/feed-dialog";
export type Post = {
  id: string;
  userId: string;
  title: string;
  description: string;
  allowInteractions: "all" | "none";
  fileSize: "small" | "medium" | "large";
  visibility: "public" | "private";
  categoryId: string;
  createdAt: string;
  updatedAt: string;

  category: Category;
  topics: Topic[];
  media: Media[];
};

export type Category = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  kind: "image" | "video";
  src: string;
  videoId: string | null;
  poster: string | null;
  width: number;
  height: number;
  aspectRatio: number;
  alt: string | null;
  order: number;
  postId: string;
};
export default async function ModalPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  async function loadPost(postId: string) {
    try {
      const response = await fetch(
        `${process.env.BETTER_AUTH_URL}/api/data/posts/public?id=${postId}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Error al obtener el post");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const post = await loadPost(postId);

  return <FeedDialog post={post.post} />;
}
