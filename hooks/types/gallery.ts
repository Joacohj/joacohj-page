export type MediaFile = {
  id: string;
  kind: "image" | "video" | "youtube";
  src: string | null;
  videoId: string | null;
  poster: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  alt: string | null;
  order: number;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  media: MediaFile[];
};