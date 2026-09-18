"use client";
import { useEffect, useState } from "react";
import EntriesMasonry from "../../../components/Masonry";

export type MediaFile = {
  id: string;
  order: number;
  kind: "image" | "video";
  src: string;
  width: number;
  height: number;
  alt: string | null;
  poster: string | null;
  description: string;
  aspectRatio: number;
};
export type Post = { id: string; section: string; body: string; media: MediaFile[] };
export default function GalleryOverview() {
  const [mediaFiles, setMediaFiles] = useState<Post[]>([]);
  useEffect(() => {
    async function getData() {
      const response = await fetch("/en/api/data");
      const data = await response.json();
      setMediaFiles(
        data.posts.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (post: any): Post => ({
            id: post.id,
            section: post.title,
            body: post.description,
            media: post.media.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (media: any): MediaFile => ({
                order: media.order,
                kind: media.kind,
                src: media.src,
                id: media.id,
                poster: media.poster,
                alt: media.alt,
                width: media.width,
                height: media.height,
                aspectRatio: media.aspectRatio,
                description: post.description,
              }),
            ),
          }),
        ),
      );
      
    }
    getData();
    
  }, []);
  return (
    <section className="w-full flex flex-col  px-5 sm:px-15 xl:px-30 mt-10">
      <article>
        <h4 className="text-2xl font-semibold text-foreground">
          Gallery Overview
        </h4>
        <p className="text-xl text-muted-foreground">
          Lorem ipsum dolor sit amet.
        </p>
      </article>

      <article className="w-full mt-10 pb-10">
        <EntriesMasonry posts={mediaFiles} />
      </article>
    </section>
  );
}
