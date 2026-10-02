import PostPage from "@/features/blog/post-page";
import { getPublicBlogPosts } from "@/services/blog/blog.service";
import { redirect } from "next/navigation";

export default async function Post({
    params,
}: {
    params: Promise<{ postId: string }>;
}) {
    const { postId } = await params;
    const posts = await getPublicBlogPosts(null, 0);
    const post = posts.find(post => post.id === postId)

    if(!post?.id) {
        return redirect("/")
    }

    return <PostPage jsonContent={JSON.stringify(post.content)} banner={post.banner} createdAt={post.createdAt} 
    description={post.description ?? ""} id={post.id} title={post.title}  />
}