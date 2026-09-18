export type MediaFile = {
  id: string;
  order: number;
  kind: "image" | "video";
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
  alt: string | null;
  poster: string | null;
  description: string;
};

export type Post = {
  id: string;
  title: string;
  description: string;
  media: MediaFile[];
};