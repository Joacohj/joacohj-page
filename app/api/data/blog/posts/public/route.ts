import { getPublicBlogPosts } from "@/services/blog/blog.service";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await getPublicBlogPosts()
    return NextResponse.json({data})
}