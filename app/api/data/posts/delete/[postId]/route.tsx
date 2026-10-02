import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { deletePost } from "@/services/post/post.service";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/data/posts/delete/[postId]'>) {

    const session = await auth.api.getSession({
        headers: _req.headers,
    });

    if (!session) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { postId } = await ctx.params;

    try {
        const result = await deletePost(postId);

        if(!result) {
            return Response.json({ error: "Error on delete post" }, { status: 500 });
        }

        return Response.json({data: "success"}, {status: 201});
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return Response.json({ error: "Post not found" }, { status: 404 });
        }
    }
}