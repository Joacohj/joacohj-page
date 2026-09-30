/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useFilterStore } from "@/app/[locale]/gallery/feed/page";
import { Post } from "@/generated/prisma/client";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Masonry, MasonryLoadingOptions } from "react-motion-gallery";
import "react-motion-gallery/styles.css";

type MasonryPost = {
    src: string;
    alt: string;
    width: number;
    height: number;
    id: string;
};

async function getPostImages() {
    try {
        const response = await fetch("/api/data/posts/public", {
            cache: "no-cache",
        });

        if (!response.ok) {
            return {
                success: false,
                error: "No media allowed.",
            };
        }
        const data = await response.json();
        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error,
        };
    }
}

export function BasicMasonry({ showUrl = true, allowFilters = false, limit = 10 }: { showUrl?: boolean, allowFilters?: boolean, limit?: number }) {
    const [masonryPosts, setMasonryPosts] = useState<MasonryPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true)
    const enabled = useFilterStore((state) => state.enabled);
    const date = useFilterStore((state) => state.date);
    const search = useFilterStore((state) => state.search);
    const category = useFilterStore((state) => state.category);
    const setResult = useFilterStore((state) => state.setResults);
    async function setImages() {
        try {
            const response = await getPostImages();
            if (response.success) {
                const postImages = response?.data?.posts.filter(
                    (post: { media: any; visibility: "public" | "private" }) =>
                        post.media?.length > 0 && post.visibility == 'public'
                );
                const postsOneImage = postImages.map((post: { media: { kind: string; }; }) => ({ ...post, media: post.media?.find((media: { kind: string; }) => media.kind == 'image') }));
                let filtedPosts = postsOneImage;
                if (enabled && allowFilters) {
                    if (category.id.length > 0) {
                        filtedPosts = filtedPosts.filter((post: Post) => {
                            return post.categoryId == category.id
                        })
                    }
                    if (date && date.getDay() !== new Date().getDay()) {
                        filtedPosts = filtedPosts.filter((post: Post) => {
                            const dateD = new Date(post.createdAt);

                            return dateD <= date;
                        });
                    }
                    if (search.length > 0) {


                        filtedPosts = filtedPosts.filter((post: Post) => {
                            return post.title.toLowerCase().includes(search.toLowerCase())
                        })
                    }
                }

                if (allowFilters) {
                    if (category.id.length > 0) {
                        filtedPosts = filtedPosts.filter((post: Post) => {
                            return post.categoryId == category.id
                        })
                    }
                }

                const data = filtedPosts.map(
                    (post: {
                        height: number;
                        src: string;
                        alt: string;
                        width: number;
                        id: string;
                        media: { width: number; height: number; alt: string; src: string };
                    }) => ({
                        id: post?.id,
                        width: post?.media.width,
                        height: post?.media.height,
                        alt: post?.media.alt,
                        src: post?.media.src
                    }),
                )

                setResult(data.length);
                if (limit > 0)
                    setMasonryPosts(data.slice(0, limit))
                else
                    setMasonryPosts(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {


        setImages();
    }, [enabled, date, search, category]);

    const masonryLoadingOptions: MasonryLoadingOptions = {
        skeleton: {
            className: `bg-accent h-[3800px] w-45 animate-pulse`
        },
        keepSkeletonMounted: true,
        count: 6,
        waitForMedia: true,
        active: loading,
        // enabled: loading,
        force: true

    }
    if (masonryPosts.length <= 0) {
        return <div className="w-full flex-col my-20 flex justify-center items-center">
            <p className="text-2xl text-muted-foreground font-light">There are no posts yet</p>
            <p className="text-muted-foreground/70 text-sm">try looking on another category.</p>
        </div>

    }
    return (

        <Masonry
            columns={{ 0: 1, 700: 2, 1100: 3 }}
            gap={{ 0: 12, 1100: 20 }}
            className="w-full"
            loading={masonryLoadingOptions}

        >
            {masonryPosts.map((image, index) => {
                return (
                    <Masonry.Item
                        key={image.id}
                        width={image.width}
                        height={image.height}
                    // span={image.span}
                    >
                        <Link href={`/gallery/feed${showUrl ? "/" + image.id : "?id=" + image.id}`}>
                            <img
                                width={image.width}
                                height={image.height}
                                loading="eager"
                                src={image.src}
                                alt={image.alt}
                                className=" w-full h-full object-cover rounded-xl"
                            />
                        </Link>
                    </Masonry.Item>
                )
            })}
        </Masonry>
    );
}
