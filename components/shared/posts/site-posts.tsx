"use client"
import { getPublicBlogPosts } from "@/services/blog/blog.service"
import { Post } from "./site-post";
import { useEffect, useState } from "react";

type Post = {
  banner: string;
  createdAt: Date;
  id: string;
  title: string;
  description: string;
}

export function Posts() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {

    async function getPosts() {
      try {
        const response = await fetch("/api/data/blog/posts/public");
        const data = await response.json();
        console.log(data)
        setPosts(data.data);
      } catch (error) {

      } finally {
        setLoading(false)
      }
    }
    getPosts()
  }, [])
  if (loading) {
    return <div className="flex flex-col gap-10">
      <article className="w-full min-h-40 border border-border overflow-hidden rounded-xl bg-card grid xl:grid-cols-[1fr_250px] animate-pulse">
        {/* Content */}
        <div className="order-2 xl:order-1 w-full px-10 py-5">
          <div className="xl:w-1/4">
            {/* Title */}
            <div className="h-6 w-3/4 xl:w-full rounded-md bg-muted" />

            {/* Divider */}
            <div className="h-0.5 w-full bg-muted my-2" />
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 my-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>

          {/* Description */}
          <div className="h-4 w-2/3 rounded bg-muted mt-3" />
        </div>

        {/* Banner */}
        <div className="order-1 xl:order-2 w-full h-[200px] xl:h-full bg-muted overflow-hidden rounded-xl border border-border shadow-sm" />
      </article>
    </div>
  }
  return <div className="flex flex-col gap-10">
    {posts.map(post => <Post key={post.id} banner={post.banner} createdAt={post.createdAt} description={post.description ?? ""} id={post.id} title={post.title} />)}
    {/* <PaginationComponent /> */}
  </div>
}