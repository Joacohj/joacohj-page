import { useEffect, useState } from "react";
import { GalleryCore } from "react-motion-gallery/core";
import { toMediaItems } from "react-motion-gallery/media";
import { Slider, createSliderIndexChannel } from "react-motion-gallery/slider";
import { useSliderReady } from "react-motion-gallery/slider/ready";
import { useFullscreenController } from "react-motion-gallery/fullscreen";
import { FullscreenThumbnailSlider } from "react-motion-gallery/fullscreenThumbnails";
import { ThumbnailSlider } from "react-motion-gallery/thumbnails";
import { SliderSkeleton } from "react-motion-gallery/skeleton/slider";
import { fullscreenSlider } from "react-motion-gallery/fullscreen/slider";
import { fullscreenZoomPan } from "react-motion-gallery/fullscreen/zoom-pan";
import { sliderFullscreen } from "react-motion-gallery/slider/fullscreen";
import styles from "./fullscreen-thumbnails-demo.module.css";
import { sliderParallax } from "react-motion-gallery/slider/parallax";
import "react-motion-gallery/styles.css";
import "plyr/dist/plyr.css";
import { PlyrVideo } from "@/components/plyr-video/plyr-vide";
import "./thumbnail.css"
import { Pause } from "lucide-react";
import { cn } from "cn";
import Video from "@/components/video/video-slide";
export type Post = {
  id: string;
  userId: string;
  title: string;
  description: string;
  allowInteractions: "all" | "none";
  fileSize: "small" | "medium" | "large";
  visibility: "public" | "private";
  categoryId: string;
  createdAt: string;
  updatedAt: string;

  category: Category;
  topics: Topic[];
  media: Media[];
};

export type Category = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  kind: "image" | "video";
  src: string;
  videoId: string | null;
  poster: string | null;
  width: number;
  height: number;
  aspectRatio: number;
  alt: string | null;
  order: number;
  postId: string;
};

function buildVideoSource(src: string) {
  return {
    type: "video" as const,
    sources: [
      {
        src,
        type: "video/mp4" as const,
      },
    ],
  };
}

function buildYoutubeSource(videoId: string) {
  return {
    type: "video" as const,
    sources: [
      {
        src: videoId,
        provider: "youtube" as const,
      },
    ],
  };
}

function Slide({ media }: { media: Media }) {

  if (media.kind === "video") {
    return (
      <div className={styles.slideFrame}>
        <Video media={media} className={styles.slide} />
      </div>
    );
  }

  if (media.kind === "image")
    return (
      <div className={styles.slideFrame}>
        <div className={cn("group relative p-0 overflow-hidden rounded-xl", styles.slide)}>
          <img
            src={media.src}
            alt={media.alt ?? "Imagen"}
            className={styles.slide}
          />
        </div>
      </div>


    );


  return (
    <div className={styles.slideFrame}>
      <Video media={media} className={styles.slide} />
    </div>
  );

}
function Thumb({ src, i }: { src: string; i: number }) {
  return (
    <img
      src={src}
      alt={`Thumbnail ${i + 1}`}
      className={cn(styles.thumbnailImage,"h-full w-[400px] object-cover rounded-xl")}
    />
  );
}

// function FullscreenThumbnailsAddon() {
//   const { fullscreenNode, fullscreenThumbnailBridge } = useFullscreenController(
//     {
//       plugins: [fullscreenSlider(), fullscreenZoomPan()],
//       fullscreen: {
//         enabled: true,
//       },
//     },
//   );

//   return (
//     <>
//       {fullscreenNode}
//       <FullscreenThumbnailSlider
//         bridge={fullscreenThumbnailBridge}
//         items={SLIDES.map((slide, i) => ({
//           thumbSrc: slide.thumbSrc,
//           alt: `Thumbnail ${i + 1}`,
//         }))}
//         position="left"
//         thumbnailsCenter
//         thumbnailWidth={72}
//         thumbnailHeight={108}
//         containerStyle={{
//           width: 112,
//           height: "100dvh",
//           padding: "18px 20px",
//           overflow: "visible",
//           background: "rgba(8, 13, 24, 0.82)",
//           borderRight: "1px solid rgba(255, 255, 255, 0.12)",
//           boxShadow: "18px 0 48px rgba(0, 0, 0, 0.24)",
//         }}
//         thumbnailItemClassName={styles.fullscreenThumbnailThumb}
//         gap={10}
//         centerActiveThumb
//         showArrows
//       />
//     </>
//   );
// }
type PostThumbnailsProps = {
  media: Media[];
};
export function PostThumbnails({ media }: PostThumbnailsProps) {
  const [indexChannel] = useState(() => createSliderIndexChannel());

  const { ref: sliderRef } = useSliderReady();

  const hasThumbnails = media.length > 1;

  return (
    <GalleryCore layout="slider">
      <div
        className={`${styles.demoShell} ${!hasThumbnails ? styles.singleMedia : ""
          }`}
      >
        {hasThumbnails && (
          <div className={styles.thumbnailRailSlot}>
            <ThumbnailSlider
              indexChannel={indexChannel}
              options={{
                layout: {
                  position: "left",
                  gap: 10,
                  center: true,
                  thumbnail: {
                    width: 72,
                    height: 108,
                  },
                  container: {
                    width: 72,
                    height: "100%",
                  },
                },
                scroll: {
                  centerActiveThumb: true,
                },
                controls: {
                  enabled: true,
                },
                elements: {
                  container: {
                    className: styles.thumbnailRail,
                  },
                  thumbnail: {
                    className: styles.thumbnailThumb,
                  },
                },
                transitions: {
                  loading: {
                    skeletonCount: 5,
                    elements: {
                      container: {
                        className: styles.thumbnailSkeletonContainer,
                      },
                      thumbnail: {
                        className: styles.thumbnailSkeletonThumb,
                      },
                    },
                  },
                },
              }}
            >
              {media.map((item, i) => (
                <Thumb
                  key={item.id}
                  src={
                    item.videoId
                      ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
                      : item.kind === "video" && item.poster
                        ? item.poster
                        : item.src
                  }
                  i={i}
                />
              ))}
            </ThumbnailSlider>
          </div>
        )}

        <div className={styles.sliderColumn}>
          {media.length > 0 ? (
            <Slider
              ref={sliderRef}
              indexChannel={indexChannel}
              plugins={[
                sliderFullscreen(),
              ]}
            >
              {media.map((item, i) => (
                <Slide key={item.id} media={item} />
              ))}
            </Slider>
          ) : (
            <div className="flex w-full rounded-xl bg-accent animate-animate-pulse h-full items-center justify-center">
              {/* Cargando... */}
            </div>
          )}
        </div>
      </div>
    </GalleryCore>
  );
}
