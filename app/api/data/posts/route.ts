import { NextResponse } from "next/server";
import { getPosts } from "@/services/post/post.service";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    Number(searchParams.get("limit")) || 10,
    50
  );

  const cursor = searchParams.get("cursor");

  const posts = await getPosts(cursor, limit);

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