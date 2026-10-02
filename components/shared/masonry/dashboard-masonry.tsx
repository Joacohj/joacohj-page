"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { GalleryCore } from "react-motion-gallery/core";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { fullscreenVideo } from "react-motion-gallery/fullscreen/video";
import { MasonryItem } from "react-motion-gallery/masonry";
import { MediaItem, Video } from "react-motion-gallery";

import {
  Entries,
  flattenEntries,
  type EntryCardRenderArgs,
  type EntryMediaRenderArgs,
  type EntryOverlayRenderArgs,
} from "react-motion-gallery/entries";

import { createEntriesMasonryMedia } from "react-motion-gallery/entries/media/masonry";

import "plyr/dist/plyr.css";
import "react-motion-gallery/styles.css";

import {
  DotsVerticalIcon,
  InfoCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Post } from "@/hooks/types/gallery";

import styles from "./entries-masonry-demo.module.css";
import { entriesMasonrySkeletonText } from "./entries-masonry.skeleton-text.generated";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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
      videoId?: string;
    };

type DemoEntry = {
  id: string;
  section: string;
  title: string;
  body: string;
  visibility: "private" | "public";
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

/* -------------------------------------------------------------------------- */
/* Skeleton helpers                                                           */
/* -------------------------------------------------------------------------- */

function addPxToBarWidth(
  value: GeneratedSkeletonTextState["barWidth"],
  amount: number,
): GeneratedSkeletonTextState["barWidth"] {
  if (typeof value === "string") {
    const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);

    return match ? `${Number(match[1]) + amount}px` : value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      addPxToBarWidth(entry, amount),
    ) as string[];
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

/* -------------------------------------------------------------------------- */
/* Masonry configuration                                                      */
/* -------------------------------------------------------------------------- */

const ENTRY_MASONRY_MEDIA = createEntriesMasonryMedia({
  masonryObject: {
    columns: {
      0: 2,
      920: 3,
    },
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

/* -------------------------------------------------------------------------- */
/* Video helpers                                                              */
/* -------------------------------------------------------------------------- */

function buildMasonryYoutubeSource(
  src: string,
  poster?: string,
) {
  return {
    type: "video" as const,
    poster,
    sources: [
      {
        src,
        provider: "youtube" as const,
      },
    ],
  };
}

function buildMasonryVideoSource(
  src: string,
  poster?: string,
) {
  return {
    type: "video" as const,
    poster,
    sources: [
      {
        src,
        type: "video/mp4",
      },
    ],
  };
}

const MASONRY_YOUTUBE_OPTIONS = {
  controls: [] as string[],
  youtube: {
    customControls: false,
  },
};

/* -------------------------------------------------------------------------- */
/* Delete button                                                              */
/* -------------------------------------------------------------------------- */

function DeleteButton({
  postId,
  deletingPostId,
  handleDeletePost,
}: {
  postId: string;
  deletingPostId: string | null;
  handleDeletePost: (postId: string) => Promise<void>;
}) {
  const isDeleting = deletingPostId === postId;

  return (
    <Button
      onClick={() => handleDeletePost(postId)}
      disabled={isDeleting}
      variant="destructive"
    >
      {isDeleting ? (
        <>
          <Loader2 className="animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <TrashIcon />
          Delete
        </>
      )}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/* Entry card                                                                 */
/* -------------------------------------------------------------------------- */

function createRenderEntryCard(
  deletingPostId: string | null,
  handleDeletePost: (postId: string) => Promise<void>,
) {
  return function renderEntryCard({
    entry,
    entryIndex,
    media,
  }: EntryCardRenderArgs) {
    const item = entry as DemoEntry;

    const textIds =
      ENTRY_MASONRY_TEXT_IDS[entryIndex] ??
      ENTRY_MASONRY_TEXT_IDS[0]!;

    return (
      <article className={styles.entryCard}>
        {item.visibility === "private" && (
          <div className="flex gap-1 items-center py-2 px-4 bg-accent border-ring shadow-xl text-accent-foreground absolute bottom-4 rounded-xl right-4 text-sm font-light font-mono">
            <p>{item.visibility}</p>
            <InfoCircledIcon />
          </div>
        )}

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

          <div className="flex flex-col justify-center items-center">
            <span
              className={styles.entryCount}
              data-skeleton-text-id={textIds.count}
            >
              {item.media.length} slides
            </span>

            <div className="w-fit">
              {/* UPDATE */}

              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      className="text-muted-foreground"
                      size="icon-lg"
                      variant="secondary"
                    >
                      <DotsVerticalIcon />
                    </Button>
                  }
                />

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Update Post Entry
                    </DialogTitle>
                  </DialogHeader>

                  <div>
                    <form id={`update-post-${item.id}`} />
                  </div>

                  <DialogFooter>
                    <DialogClose>Close</DialogClose>

                    <Button
                      type="submit"
                      form={`update-post-${item.id}`}
                    >
                      Apply changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* DELETE */}

              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="text-destructive"
                      size="icon-lg"
                      variant="destructive"
                      disabled={deletingPostId === item.id}
                    >
                      {deletingPostId === item.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <TrashIcon />
                      )}
                    </Button>
                  }
                />

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure?
                    </DialogTitle>
                  </DialogHeader>

                  <div>
                    <p>
                      Once you delete this post every
                      multimedia will disappear.
                    </p>
                  </div>

                  <DialogFooter>
                    <DialogClose>Close</DialogClose>

                    <DeleteButton
                      postId={item.id}
                      deletingPostId={deletingPostId}
                      handleDeletePost={handleDeletePost}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <p
          className={styles.entryBody}
          data-skeleton-text-id={textIds.body}
        >
          {item.body}
        </p>

        <div className={styles.entryMedia}>
          {media}
        </div>
      </article>
    );
  };
}

/* -------------------------------------------------------------------------- */
/* Media renderer                                                             */
/* -------------------------------------------------------------------------- */

function createRenderEntryMedia(
  deletingPostId: string | null,
  handleDeletePost: (postId: string) => Promise<void>,
) {
  return function renderEntryMedia({
    media,
  }: EntryMediaRenderArgs) {
    const item = media as DemoMedia;

    /*
     * OJO:
     *
     * EntryMediaRenderArgs no necesariamente tiene el postId.
     *
     * Por eso, si necesitás eliminar el POST completo desde
     * este botón, lo ideal es que DemoMedia tenga también postId.
     */

    if (item.kind === "video") {
      return (
        <MasonryItem
          className="relative"
          width={item.width}
          height={item.height}
        >
          <div className="absolute z-40 top-3 right-3">
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="text-destructive"
                    size="icon-lg"
                    variant="destructive"
                  >
                    <TrashIcon />
                  </Button>
                }
              />

              <DialogContent
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <DialogHeader>
                  <DialogTitle>
                    Are you sure?
                  </DialogTitle>
                </DialogHeader>

                <div>
                  <p>
                    Once you delete this post every multimedia
                    will disappear.
                  </p>
                </div>

                <DialogFooter>
                  <DialogClose>Close</DialogClose>

                  {/* 
                    Acá NO llamamos handleDeletePost porque
                    DemoMedia actualmente no conoce el postId.
                  */}
                  <Button
                    variant="destructive"
                    disabled
                  >
                    <TrashIcon />
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {item.videoId ? (
            <Video
              options={{
                autoplay: true,
                muted: true,
                playsinline: true,
                controls: [],
                loop: {
                  active: true,
                },
                preload: "metadata",
              }}
              source={buildMasonryYoutubeSource(
                item.videoId,
                item.poster,
              )}
              src={item.videoId}
              poster={item.poster ?? ""}
              alt={item.alt}
              className={styles.entrySliderVideo}
            />
          ) : (
            <Video
              src={item.src}
              poster={item.poster ?? ""}
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
          )}
        </MasonryItem>
      );
    }

    if (item.kind === "image") {
      return (
        <MasonryItem
          className="relative"
          width={item.width}
          height={item.height}
        >
          <div className="absolute z-40 top-3 right-3">
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="text-destructive"
                    size="icon-lg"
                    variant="destructive"
                  >
                    <TrashIcon />
                  </Button>
                }
              />

              <DialogContent
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <DialogHeader>
                  <DialogTitle>
                    Are you sure?
                  </DialogTitle>
                </DialogHeader>

                <div>
                  <p>
                    Once you delete this post every multimedia
                    will disappear.
                  </p>
                </div>

                <DialogFooter>
                  <DialogClose>Close</DialogClose>

                  <Button
                    variant="destructive"
                    disabled
                  >
                    <TrashIcon />
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

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
  };
}

/* -------------------------------------------------------------------------- */
/* Overlay                                                                    */
/* -------------------------------------------------------------------------- */

function renderEntryOverlay({
  entry,
  media,
  mediaIndex,
}: EntryOverlayRenderArgs) {
  const item = entry as DemoEntry;
  const slide = media as DemoMedia | null;

  return (
    <div className={styles.entryOverlay}>
      <span className={styles.entryOverlayKicker}>
        {item.section}
      </span>

      <strong className={styles.entryOverlayTitle}>
        {item.title}
      </strong>

      <p className={styles.entryOverlayBody}>
        {item.body}
      </p>

      <span className={styles.entryOverlayMeta}>
        Slide {String((mediaIndex ?? 0) + 1)}
      </span>

      {slide?.description ? (
        <p className={styles.entryOverlayDescription}>
          {slide.description}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fullscreen                                                                  */
/* -------------------------------------------------------------------------- */

function buildMasonryYoutubeFullscreenSource(
  item: MediaItem,
) {
  if (item.kind !== "video") {
    return buildMasonryVideoSource("", "");
  }

  if (item.src === "") {
    return buildMasonryYoutubeSource(
      item.videoId ?? "",
      item.poster,
    );
  }

  return buildMasonryVideoSource(
    item.src,
    item.poster,
  );
}

function FullscreenAddon() {
  const { fullscreenNode } =
    useFullscreenController({
      plugins: [
        fullscreenSlider(),
        fullscreenVideo(),
        fullscreenZoomPan(),
      ],
      fullscreen: {
        enabled: true,

        video: {
          source: buildMasonryYoutubeFullscreenSource,

          playOnOpen: false,
          playOnTransition: false,

          options: {
            autoplay: false,
            loop: {
              active: true,
            },
            preload: "lazyload",
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

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

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
          aspectRatio:
            args.aspectRatios[index] ?? "4 / 3",
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

  const sectionSkeletonText =
    createBadgeSkeletonText(skeletonText.section);

  const titleSkeletonText =
    withTextMetrics(
      skeletonText.title,
      17.28,
      1.2,
    );

  const countSkeletonText =
    withTextMetrics(
      skeletonText.count,
      12.48,
      1.5,
    );

  const bodySkeletonText =
    withTextMetrics(
      skeletonText.body,
      15.2,
      1.65,
    );

  const countTextWidth =
    firstBarWidthValue(
      countSkeletonText.barWidth,
      "70px",
    );

  const mediaCount =
    args.entry?.media.length ?? 0;

  const aspectRatios =
    args.entry?.media.map(
      (media) =>
        `${media.width} / ${media.height}`,
    ) ?? [];

  const twoColumns =
    createColumnOrder(mediaCount, 2);

  const threeColumns =
    createColumnOrder(mediaCount, 3);

  return {
    layout: {
      kind: "stack" as const,

      style: {
        padding: 18,
        gap: 0,
      },

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

          columnWidth:
            "calc((100% - 12px) / 2)",

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

          columnWidth:
            "calc((100% - 24px) / 3)",

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

/* -------------------------------------------------------------------------- */
/* Posts -> Entries                                                            */
/* -------------------------------------------------------------------------- */

function postsToEntries(
  posts: Post[],
): DemoEntry[] {
  return posts
    .filter((post) => post.media.length > 0)
    .map((post) => ({
      id: post.id,

      visibility: post.visibility,

      section: "Gallery",

      title: post.title,

      body: post.description,

      media: [...post.media]
        .sort((a, b) => a.order - b.order)
        .map((media) => ({
          kind:
            media.kind === "image"
              ? "image"
              : "video",

          src: media.src ?? "",

          width: media.width ?? 16,

          height: media.height ?? 9,

          videoId:
            media.videoId ?? undefined,

          alt: media.alt ?? "",

          description: post.description,

          ...(media.kind === "video"
            ? {
                poster:
                  media.poster ?? undefined,

                videoId:
                  media.videoId ?? undefined,
              }
            : {}),
        })),
    }));
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function EntriesMasonry() {
  const [posts, setPosts] = useState<Post[]>([]);

  const [cursor, setCursor] =
    useState<string | null>(null);

  const [hasMore, setHasMore] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  /*
   * Guarda qué POST está siendo eliminado.
   *
   * null = ninguno
   * "uuid..." = ese post está siendo eliminado
   */
  const [deletingPostId, setDeletingPostId] =
    useState<string | null>(null);

  const entries = postsToEntries(posts);

  /* ---------------------------------------------------------------------- */
  /* Load posts                                                              */
  /* ---------------------------------------------------------------------- */

  async function loadPosts(
    nextCursor?: string | null,
  ) {
    if (
      loading ||
      (!hasMore && nextCursor)
    ) {
      return;
    }

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
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch posts",
        );
      }

      const data =
        await response.json();

      setPosts((current) =>
        nextCursor
          ? [
              ...current,
              ...data.posts,
            ]
          : data.posts,
      );

      setCursor(data.nextCursor);

      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Delete post                                                             */
  /* ---------------------------------------------------------------------- */

  async function handleDeletePost(
    postId: string,
  ) {
    /*
     * Evita múltiples DELETE simultáneos.
     */
    if (deletingPostId !== null) {
      return;
    }

    setDeletingPostId(postId);

    try {
      const response = await fetch(
        `/api/data/posts/delete/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          data?.error ??
            "Failed to delete post",
        );
      }

      /*
       * IMPORTANTE:
       *
       * No hacemos loadPosts().
       *
       * Simplemente sacamos el post del estado
       * local.
       */
      setPosts((current) =>
        current.filter(
          (post) =>
            post.id !== postId,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to delete post:",
        error,
      );
    } finally {
      setDeletingPostId(null);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Render functions                                                        */
  /* ---------------------------------------------------------------------- */

  const renderEntryCard =
    createRenderEntryCard(
      deletingPostId,
      handleDeletePost,
    );

  const renderEntryMedia =
    createRenderEntryMedia(
      deletingPostId,
      handleDeletePost,
    );

  /* ---------------------------------------------------------------------- */
  /* Fullscreen                                                               */
  /* ---------------------------------------------------------------------- */

  const fullscreenMedia =
    flattenEntries(entries)
      .flattenedMedia;

  /* ---------------------------------------------------------------------- */
  /* Initial load                                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPosts();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Render                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className={styles.shell}>
      <GalleryCore
        layout="entries"
        fullscreenItems={
          fullscreenMedia
        }
      >
        <Entries
          entries={{
            items: entries,

            mediaLayout: "masonry",

            overlay: {
              overlayCrossfadeTarget:
                "content",
            },

            render: {
              card: renderEntryCard,

              media: renderEntryMedia,

              overlay:
                renderEntryOverlay,
            },

            loading: {
              skeletonWrap: {
                style: {
                  background:
                    "var(--color-background)",

                  border:
                    "1px solid rgba(148, 163, 184, 0.2)",

                  borderRadius: "16px",

                  height: "100%",

                  boxShadow:
                    "0 20px 42px rgba(15, 23, 42, 0.08)",
                },
              },

              skeleton: ({
                entry,
                entryIndex,
              }) =>
                createEntryMasonrySkeleton({
                  entry:
                    entry as DemoEntry,
                  entryIndex,
                }),
            },
          }}
          fullscreen={{
            enabled: true,
          }}
          renderMediaContainer={
            ENTRY_MASONRY_MEDIA
          }
        />

        <FullscreenAddon />
      </GalleryCore>
    </div>
  );
}