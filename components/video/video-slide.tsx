"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Media } from "../shared/thumbnails/thumbnails";
import { cn } from "cn";
import { useRef, useState } from "react";

type MediaType = {
  media: Media;
  className?: string;
};

export default function Video({ media, className }: MediaType) {
  const [pause, setPause] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  function handleVideoLoaded() {
    const video = videoRef.current;
    const options = {
      root: document.body,
      rootMargin: "0px",
      scrollMargin: "0px",
      threshold: 1.0,
    };
    const observer = new IntersectionObserver((entries, options) => {

      entries.forEach(entry => {
        if (entry.target == video) {
          if (!entry.isIntersecting) {
            video.pause();
            setPause(true);
          }
        }
      })
    })
    observer.observe(video!)
    if (!video) return;

    video.volume = volume;
    video.muted = muted;

    video.play().catch(() => { });
  }

  function handleVideoClick() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play().catch(() => { });
      setPause(false);
    } else {
      video.pause();
      setPause(true);
    }
  }

  function handleVolumeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    event.stopPropagation();
    event.preventDefault()
    const newVolume = Number(event.target.value);

    const video = videoRef.current;

    if (!video) return;

    video.volume = newVolume;

    if (newVolume > 0) {
      video.muted = false;
      setMuted(false);
    }

    setVolume(newVolume);
  }

  function handleMute(e: InputEvent) {
    e.preventDefault();
    e.stopPropagation()
    const video = videoRef.current;

    if (!video) return;

    const newMuted = !video.muted;

    video.muted = newMuted;

    setMuted(newMuted);
  }

  // 🎬 YouTube
  if (media.videoId) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl",
          className
        )}
      >
        <iframe
          src={`https://www.youtube.com/embed/${media.videoId}?autoplay=1&mute=1&loop=1&playlist=${media.videoId}`}
          className={cn("h-full aspect-video", className = "h-full w-[400px] object-cover rounded-xl")}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    );
  }

  // 🎥 Video normal
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl",
        className
      )}
    >
      <video
        ref={videoRef}
        src={media.src}
        className="h-full w-[400px] object-cover rounded-xl"
        loop
        playsInline
        preload="metadata"
        onLoadedData={handleVideoLoaded}
        onClick={handleVideoClick}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
          "transition-all duration-300 ease-out",
          pause
            ? "scale-100 opacity-100"
            : "scale-75 opacity-0"
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
          {pause ? (
            <Play className="size-6 fill-current" />
          ) : (
            <Pause className="size-6 fill-current" />
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2 px-3 pb-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleMute}
          className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        >
          {muted || volume === 0 ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="h-1 w-24 cursor-pointer accent-white"
          aria-label="Volumen"
        />
      </div>
    </div>
  );
}