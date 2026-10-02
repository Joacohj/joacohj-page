"use client";

import { useEffect, useState } from "react";

import { Post } from "./site-post";
import PaginationComponent from "../pagination";

type PostData = {
  banner: string;
  createdAt: string;
  id: string;
  title: string;
  description: string;
};

const LIMIT = 2;

export function Posts() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [cursorForPage, setCursorForPage] = useState<
    Record<number, string | null>
  >({
    1: null,
  });

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = async (cursor: string | null) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
      });

      if (cursor) {
        params.set("cursor", cursor);
      }

      const response = await fetch(
        `/api/data/blog/posts/public?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Error fetching posts");
      }

      const data = await response.json();

      setPosts(data.posts);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(null);
  }, []);

  const handleNext = () => {
    if (!hasMore || !nextCursor) return;

    const nextPage = page + 1;

    // Guardamos el cursor que permite llegar a la próxima página
    setCursorForPage((current) => ({
      ...current,
      [nextPage]: nextCursor,
    }));

    setPage(nextPage);

    fetchPosts(nextCursor);
  };

  const handlePrevious = () => {
    if (page <= 1) return;

    const previousPage = page - 1;
    const cursor = cursorForPage[previousPage] ?? null;

    setPage(previousPage);

    fetchPosts(cursor);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-10">
        <article className="w-full min-h-40 border border-border overflow-hidden rounded-xl bg-card grid xl:grid-cols-[1fr_250px] animate-pulse">
          <div className="order-2 xl:order-1 w-full px-10 py-5">
            <div className="xl:w-1/4">
              <div className="h-6 w-3/4 xl:w-full rounded-md bg-muted" />
              <div className="h-0.5 w-full bg-muted my-2" />
            </div>

            <div className="flex items-center gap-1.5 my-2">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
            </div>

            <div className="h-4 w-2/3 rounded bg-muted mt-3" />
          </div>

          <div className="order-1 xl:order-2 w-full h-[200px] xl:h-full bg-muted overflow-hidden rounded-xl border border-border shadow-sm" />
        </article>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {posts.map((post) => (
        <Post
          key={post.id}
          banner={post.banner}
          createdAt={new Date(post.createdAt)}
          description={post.description ?? ""}
          id={post.id}
          title={post.title}
        />
      ))}

      <PaginationComponent
        page={page}
        hasNext={hasMore}
        hasPrevious={page > 1}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}