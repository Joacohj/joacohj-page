"use client"

import { useRouter } from "next/navigation";

import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { MasonryItem } from "react-motion-gallery/masonry";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { Video } from "react-motion-gallery";
import "plyr/dist/plyr.css";
import {
    Entries,
    flattenEntries,
    type EntryCardRenderArgs,
    type EntryMediaRenderArgs,
    type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";
import { createEntriesMasonryMedia } from "react-motion-gallery/entries/media/masonry";
import styles from "./entries-masonry-demo.module.css";
import { entriesMasonrySkeletonText } from "./entries-masonry.skeleton-text.generated";
import "react-motion-gallery/styles.css";
import { Post } from "@/types/gallery"
import { useEffect, useState } from "react";
type DemoMedia =
    | {
        kind: "image";
        src: string;
        width: number;
        height: number;
        alt: string;
        description: string;
    }
    | {
        kind: "video";
        src: string;
        width: number;
        height: number;
        alt: string;
        description: string;
        poster?: string;
    };

type DemoEntry = {
    id: string;
    section: string;
    title: string;
    body: string;
    media: DemoMedia[];
};

type EntryMasonryTextIds = {
    section: string;
    title: string;
    count: string;
    body: string;
};

type GeneratedSkeletonTextState = {
    lines: number | Record<number, number>;
    barWidth?: string | string[] | Record<number, string | string[]>;
    lastBarWidth?: string | Record<number, string>;
    barHeight?: number | Record<number, number>;
    lineHeight?: number | Record<number, number>;
    responsiveBy?: "viewport" | "container";
};

type GeneratedEntryMasonrySkeletonText = {
    section: GeneratedSkeletonTextState;
    title: GeneratedSkeletonTextState;
    count: GeneratedSkeletonTextState;
    body: GeneratedSkeletonTextState;
};

type ResolvedSkeletonTextState = GeneratedSkeletonTextState & {
    barHeight: number | Record<number, number>;
    lineHeight: number | Record<number, number>;
};

function addPxToBarWidth(
    value: GeneratedSkeletonTextState["barWidth"],
    amount: number,
): GeneratedSkeletonTextState["barWidth"] {
    if (typeof value === "string") {
        const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
        return match ? `${Number(match[1]) + amount}px` : value;
    }

    if (Array.isArray(value)) {
        return value.map((entry) => addPxToBarWidth(entry, amount) as string);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([breakpoint, entry]) => [
                breakpoint,
                addPxToBarWidth(entry, amount),
            ]),
        ) as Record<number, string | string[]>;
    }

    return value;
}

function firstBarWidthValue(
    value: GeneratedSkeletonTextState["barWidth"],
    fallback: string,
): string {
    if (typeof value === "string") return value;

    if (Array.isArray(value)) {
        return firstBarWidthValue(value[0], fallback);
    }

    if (value && typeof value === "object") {
        const firstBreakpoint = Object.keys(value)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b)[0];

        return firstBreakpoint == null
            ? fallback
            : firstBarWidthValue(value[firstBreakpoint], fallback);
    }

    return fallback;
}

function withTextMetrics(
    text: GeneratedSkeletonTextState,
    fallbackBarHeight: number,
    fallbackLineHeight: number,
): ResolvedSkeletonTextState {
    return {
        ...text,
        barHeight: text.barHeight ?? fallbackBarHeight,
        lineHeight: text.lineHeight ?? fallbackLineHeight,
    };
}

function createBadgeSkeletonText(
    text: GeneratedSkeletonTextState,
): ResolvedSkeletonTextState {
    return {
        ...text,
        barWidth: addPxToBarWidth(text.barWidth, 20),
        barHeight: 29,
        lineHeight: 1,
    };
}


const ENTRY_MASONRY_MEDIA = createEntriesMasonryMedia({
    masonryObject: {
        columns: { 0: 2, 920: 3 },
        gap: 12,
        loading: {
            enabled: false,

        },

    },
});

const ENTRY_MASONRY_TEXT_IDS: EntryMasonryTextIds[] = [
    {
        section: "entriesMasonryEntry01Section",
        title: "entriesMasonryEntry01Title",
        count: "entriesMasonryEntry01Count",
        body: "entriesMasonryEntry01Body",
    },
    {
        section: "entriesMasonryEntry02Section",
        title: "entriesMasonryEntry02Title",
        count: "entriesMasonryEntry02Count",
        body: "entriesMasonryEntry02Body",
    },
    {
        section: "entriesMasonryEntry03Section",
        title: "entriesMasonryEntry03Title",
        count: "entriesMasonryEntry03Count",
        body: "entriesMasonryEntry03Body",
    },
];

const ENTRY_MASONRY_SKELETON_TEXT: GeneratedEntryMasonrySkeletonText[] =
    ENTRY_MASONRY_TEXT_IDS.map((textIds) => ({
        section: entriesMasonrySkeletonText[textIds.section]!,
        title: entriesMasonrySkeletonText[textIds.title]!,
        count: entriesMasonrySkeletonText[textIds.count]!,
        body: entriesMasonrySkeletonText[textIds.body]!,
    }));

const ENTRY_MASONRY_MEDIA_ASPECT_RATIOS = [
    ["1400 / 900", "1200 / 1200", "1300 / 1600", "1000 / 1350"],
    ["1100 / 800", "1200 / 1000", "900 / 1300", "1400 / 850"],
    ["1000 / 1500", "1400 / 1100", "1100 / 900", "1500 / 1300"],
];

const ENTRY_MASONRY_MEDIA_COLUMN_ORDERS = [
    {
        two: [
            [0, 2],
            [1, 3],
        ],
        three: [[0, 3], [1], [2]],
    },
    {
        two: [
            [0, 2],
            [1, 3],
        ],
        three: [[0, 3], [1], [2]],
    },
    {
        two: [
            [0, 3],
            [1, 2],
        ],
        three: [[0], [1, 3], [2]],
    },
];

function renderEntryCard({ entry, entryIndex, media }: EntryCardRenderArgs) {
    const item = entry as DemoEntry;
    const textIds =
        ENTRY_MASONRY_TEXT_IDS[entryIndex] ?? ENTRY_MASONRY_TEXT_IDS[0]!;

    return (
        <article className={styles.entryCard}>
            <div className={styles.entryMeta}>
                <div>
                    <span
                        className={styles.entryKicker}
                        data-skeleton-text-id={textIds.section}
                    >
                        {item.section}
                    </span>
                    <h3
                        className={styles.entryTitle}
                        data-skeleton-text-id={textIds.title}
                    >
                        {item.title}
                    </h3>
                </div>
                <span
                    className={styles.entryCount}
                    data-skeleton-text-id={textIds.count}
                >
                    {item.media.length} slides
                </span>
            </div>
            <p className={styles.entryBody} data-skeleton-text-id={textIds.body}>
                {item.body}
            </p>
            <div className={styles.entryMedia}>{media}</div>
        </article>
    );
}

function renderEntryMedia({ media }: EntryMediaRenderArgs) {
    const item = media as DemoMedia;

    if (media.kind === "video") {
        return (
            <MasonryItem
                width={item.width}
                height={item.height}
            >
                <Video
                    src={item.src}
                    poster={media.poster ?? ''}
                    alt={item.alt}
                    className={styles.entrySliderVideo}
                    options={{
                        autoplay: true,
                        preload: "metadata",
                        muted: true,
                        playsinline: true,
                        controls: [],
                        loop: {
                            active: true,
                        },
                    }}
                />
            </MasonryItem>
        );
    }

    if (item.kind === "image") {
        return (
            <MasonryItem
                width={item.width}
                height={item.height}
            >
                <img
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    className={styles.entrySliderImage}
                />
            </MasonryItem>
        );
    }

    return null;
}


function renderEntryOverlay({
    entry,
    media,
    mediaIndex,
}: EntryOverlayRenderArgs) {
    const item = entry as DemoEntry;
    const slide = media as DemoMedia | null;
    return (
        <div className={styles.entryOverlay}>
            <span className={styles.entryOverlayKicker}>{item.section}</span>
            <strong className={styles.entryOverlayTitle}>{item.title}</strong>
            <p className={styles.entryOverlayBody}>{item.body}</p>
            <span className={styles.entryOverlayMeta}>
                Slide {String((mediaIndex ?? 0) + 1)}
            </span>
            {slide?.description ? (
                <p className={styles.entryOverlayDescription}>{slide.description}</p>
            ) : null}
        </div>
    );
}
function FullscreenAddon() {
    const { fullscreenNode } = useFullscreenController({
        plugins: [
            fullscreenSlider(),
            fullscreenVideo(),
            fullscreenZoomPan(),
        ],
        fullscreen: {
            enabled: true,
            video: {
                playOnOpen: false,
                playOnTransition: false,
                options: {
                    autoplay: false,
                    loop: { active: true },
                    preload: 'lazyload',
                    controls: [
                        "play-large",
                        "play",
                        "progress",
                        "current-time",
                        "mute",
                        "volume",
                        "fullscreen",
                    ],
                },
            },
        },
    });

    return <>{fullscreenNode}</>;
}
function createMasonryMediaSkeletonGroup(args: {
    aspectRatios: string[];
    columns: number[][];
    columnWidth: string;
    style: Record<string, unknown>;
}) {
    return {
        kind: "row" as const,
        style: {
            gap: 12,
            width: "100%",
            align: "flex-start",
            overflow: "hidden",
            ...args.style,
        },
        children: args.columns.map((indexes) => ({
            kind: "col" as const,
            style: {
                gap: 12,
                width: args.columnWidth,
            },
            children: indexes.map((index) => ({
                kind: "rect" as const,
                style: {
                    width: "100%",
                    background: "var(--color-accent)",
                    aspectRatio: args.aspectRatios[index] ?? "4 / 3",
                    borderRadius: "16px",
                },
            })),
        })),
    };
}

function createColumnOrder(
    mediaCount: number,
    columns: number,
): number[][] {
    const result = Array.from(
        { length: columns },
        () => [] as number[],
    );

    for (let i = 0; i < mediaCount; i++) {
        result[i % columns].push(i);
    }

    return result;
}

function createEntryMasonrySkeleton(args: {
    entry: DemoEntry | undefined;
    entryIndex: number;
}) {
    const skeletonText =
        ENTRY_MASONRY_SKELETON_TEXT[args.entryIndex] ??
        ENTRY_MASONRY_SKELETON_TEXT[0]!;
    const sectionSkeletonText = createBadgeSkeletonText(skeletonText.section);
    const titleSkeletonText = withTextMetrics(skeletonText.title, 17.28, 1.2);
    const countSkeletonText = withTextMetrics(skeletonText.count, 12.48, 1.5);
    const bodySkeletonText = withTextMetrics(skeletonText.body, 15.2, 1.65);
    const countTextWidth = firstBarWidthValue(countSkeletonText.barWidth, "70px");
    const mediaCount = args.entry?.media.length ?? 0;

    const aspectRatios =
        args.entry?.media.map(
            (media) => `${media.width} / ${media.height}`,
        ) ?? [];

    const twoColumns = createColumnOrder(mediaCount, 2);
    const threeColumns = createColumnOrder(mediaCount, 3);

    return {
        layout: {
            kind: "stack" as const,
            style: { padding: 18, gap: 0 },
            children: [
                {
                    kind: "row" as const,
                    style: {
                        justify: "space-between",
                        align: "flex-start",
                        background: "var(--color-accent)",
                        width: "100%",
                        gap: 16,
                    },
                    children: [
                        {
                            kind: "col" as const,
                            style: {
                                gap: 12,
                                background: "var(--color-accent)",
                                width: `calc(100% - ${countTextWidth} - 16px)`,
                            },
                            children: [
                                {
                                    kind: "text" as const,
                                    ...sectionSkeletonText,
                                    style: {
                                        borderRadius: 999,
                                    },
                                },
                                {
                                    kind: "text" as const,
                                    ...titleSkeletonText,
                                    style: {
                                        width: "100%",
                                        background: "var(--color-accent)",
                                        marginBottom: "6px",
                                    },
                                },
                            ],
                        },
                        {
                            kind: "text" as const,
                            ...countSkeletonText,
                            style: {
                                width: countTextWidth,
                                background: "var(--color-accent)",
                                marginTop: 2,
                            },
                        },
                    ],
                },
                {
                    kind: "text" as const,
                    ...bodySkeletonText,
                    style: {
                        width: "100%",
                        marginBottom: "12px",
                    },
                },
                createMasonryMediaSkeletonGroup({
                    aspectRatios,
                    columns: twoColumns,
                    columnWidth: "calc((100% - 12px) / 2)",
                    style: {
                        background: "var(--color-accent)",
                        display: "flex",
                        920: {
                            display: "none",
                        },
                    },
                }),
                createMasonryMediaSkeletonGroup({
                    aspectRatios,
                    columns: threeColumns,
                    columnWidth: "calc((100% - 24px) / 3)",
                    style: {
                        display: "none",
                        background: "var(--color-accent)",
                        920: {
                            display: "flex",
                        },
                    },
                }),
            ],
        },
    };
}


function postsToEntries(posts: Post[]): DemoEntry[] {
    return posts
        .filter((post) => post.media.length > 0)
        .map((post) => ({
            id: post.id,
            section: "Gallery",
            title: post.title,
            body: post.description,

            media: [...post.media]
                .sort((a, b) => a.order - b.order)
                .map((media) => ({
                    kind: media.kind,
                    src: media.src,
                    width: media.width,
                    height: media.height,
                    alt: media.alt ?? "",
                    description: post.description,
                    ...(media.kind === "video"
                        ? {
                            poster: media.poster ?? undefined,
                        }
                        : {}),
                })),
        }));
}


export default function EntriesMasonry({ }) {

    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const entries = postsToEntries(posts);
    async function loadPosts(nextCursor?: string | null) {
        if (loading || (!hasMore && nextCursor)) return;

        setLoading(true);

        try {
            const params = new URLSearchParams({
                limit: "10",
            });

            if (nextCursor) {
                params.set("cursor", nextCursor);
            }

            const response = await fetch(
                `/api/data/posts?${params.toString()}`,
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }

            const data = await response.json();

            setPosts((current) =>
                nextCursor
                    ? [...current, ...data.posts]
                    : data.posts,
            );

            setCursor(data.nextCursor);
            setHasMore(data.hasMore);
        } finally {
            setLoading(false);
        }
    }
    const fullscreenMedia =
        flattenEntries(entries).flattenedMedia;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPosts()
    }, [])
    return (
        <div className={styles.shell}>
            <GalleryCore layout="entries" fullscreenItems={fullscreenMedia}>
                <Entries
                    entries={{
                        items: entries,
                        mediaLayout: "masonry",
                        overlay: {
                            overlayCrossfadeTarget: "content",
                        },
                        render: {
                            card: renderEntryCard,
                            media: renderEntryMedia,
                            overlay: renderEntryOverlay,
                        },
                        loading: {
                            skeletonWrap: {
                                style: {
                                    background: "var(--color-background)",
                                    border: "1px solid rgba(148, 163, 184, 0.2)",
                                    borderRadius: "16px",
                                    height: "100%",
                                    boxShadow: "0 20px 42px rgba(15, 23, 42, 0.08)",
                                },
                            },
                            skeleton: ({ entry, entryIndex }) =>
                                createEntryMasonrySkeleton({
                                    entry: entry as DemoEntry,
                                    entryIndex,
                                }),
                        },
                    }}
                    fullscreen={{ enabled: true }}
                    renderMediaContainer={ENTRY_MASONRY_MEDIA}
                />
                <FullscreenAddon />

            </GalleryCore>
        </div>
    );
}
