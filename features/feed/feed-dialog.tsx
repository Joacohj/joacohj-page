"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LiquidButton } from "@/components/shared/liquid/liquid-glass";
import { DotsVerticalIcon, Share1Icon } from "@radix-ui/react-icons";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Post } from "@/app/[locale]/gallery/feed/@modal/(.)[postId]/page";
import { PostThumbnails } from "@/components/shared/thumbnails/thumbnails";
import { useLocale } from "next-intl";

export default function FeedDialog({ post }: { post: Post }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const date = new Date(post.createdAt);
    const locale = useLocale();
    const formattedDate = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
    const from = searchParams.get("from");

    return (
        <Dialog
            open={true}
            onOpenChange={(open) => {
                if (!open) {
                    if (from !== null) {
                        window.location.href = "/gallery/feed";
                    } else {
                        router.back();
                    }

                }
            }}
        >
            <DialogContent className="border-ring max-w-fit min-h-[70svh] sm:max-w-fit grid grid-cols-[500px_500px] w-full">
                <PostThumbnails media={post.media ?? []} />

                <article className="w-full h-full flex overflow-auto scrollbar-none">
                    <div className="px-8 w-full">
                        <p className="text-2xl font-heading mt-10">
                            {post.title}
                        </p>
                        <p className="text-sm text-muted-foreground"> <time>{formattedDate}</time></p>

                        <div className="flex gap-2 mt-3 items-center flex-wrap w-full text-xs">
                            <div className="flex gap-2">
                                {post.topics?.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className="px-5 py-1 rounded-lg bg-accent text-accent-foreground shadow border-ring"
                                    >
                                        {topic.title}
                                    </div>
                                ))}
                            </div>

                            <Separator className="w-full h-0.5 bg-accent my-3" />

                            <div className="w-full">
                                <p className="text-xl font-light wrap-break-word">
                                    {post.description}
                                </p>
                            </div>

                            <div className="absolute bottom-4 right-4 gap-2 flex">
                                <LiquidButton onClick={() => { }}>
                                    <Share1Icon className="text-foreground size-5" />
                                </LiquidButton>

                                <LiquidButton onClick={() => { }}>
                                    <DotsVerticalIcon className="text-foreground size-5" />
                                </LiquidButton>
                            </div>
                        </div>
                    </div>
                </article>
            </DialogContent>
        </Dialog>
    );
}