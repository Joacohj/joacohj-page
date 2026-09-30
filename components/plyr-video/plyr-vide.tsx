"use client";

import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";

type Props = {
  src: string;
  poster?: string | null;
};

export function PlyrVideo({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let player: any;

    async function init() {
      if (!videoRef.current) return;

      const { default: Plyr } = await import("plyr");

      player = new Plyr(videoRef.current, {
        controls: [
        ],

        autoplay: true,
        muted: false,
        clickToPlay: true,

        loop: {
          active: true,
        },
      });

      console.log("Plyr inicializado:", player);
    }

    init();

    return () => {
      player?.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}