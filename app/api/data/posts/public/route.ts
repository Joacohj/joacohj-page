import { NextResponse } from "next/server";
import { getPosts, getPublicPost, getPublicPosts } from "@/services/post/post.service";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    Number(searchParams.get("limit")) || 10,
    50
  );
  const postId = searchParams.get("id");
  if(postId !== null && postId.length > 0) {
    const post = await getPublicPost(postId);
    return NextResponse.json({post})
  }

  const cursor = searchParams.get("cursor");

  const posts = await getPublicPosts(cursor, limit);

  const hasMore = posts.length > limit;

  if (hasMore) {
    posts.pop();
  }

  const nextCursor =
    hasMore && posts.length > 0
      ? posts[posts.length - 1].id
      : null;

  return NextResponse.json({
    posts,
    nextCursor,
    hasMore,
  });
}