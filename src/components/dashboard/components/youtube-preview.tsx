import { getYoutubeVideoId } from "@/hooks/utils/helpers";

type YoutubePreviewProps = {
  url: string;
};

export function YoutubePreview({ url }: YoutubePreviewProps) {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}