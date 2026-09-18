export type GalleryMedia =
  | {
      kind: "image"
      src: string
      alt: string
      width: number
      height: number
      description?: string
    }
  | {
      kind: "video"
      src: string
      alt: string
      poster?: string
      width: number
      height: number
      description?: string
    }

export type GalleryEntry = {
  id: string
  section: string
  title: string
  body: string
  media: GalleryMedia[]
}

export const GALLERY_ENTRIES: GalleryEntry[] = [
  {
    id: "landscapes",
    section: "Landscapes",
    title: "Between mountains and mist",
    body: "A collection of quiet places captured at first light — still water, cold air, and long horizons.",
    media: [
      {
        kind: "image",
        src: "/gallery/mountain-lake.png",
        alt: "Wooden cabin on a still alpine lake at dawn",
        width: 900,
        height: 1200,
        description: "Cabin on the lake — Dolomites, 05:41",
      },
      {
        kind: "image",
        src: "/gallery/snowy-peaks.png",
        alt: "Snow-capped peaks above a pine forest",
        width: 900,
        height: 1200,
        description: "First snow over the ridge line",
      },
      {
        kind: "image",
        src: "/gallery/poppy-field.png",
        alt: "Field of red poppies under an overcast sky",
        width: 1200,
        height: 800,
        description: "Poppies in early summer",
      },
    ],
  },
  {
    id: "studio",
    section: "Studio",
    title: "Form in motion",
    body: "Abstract studies rendered under controlled light, exploring color, gloss and depth.",
    media: [
      {
        kind: "image",
        src: "/gallery/abstract-blue.png",
        alt: "Glossy cobalt-blue fluid sculpture",
        width: 900,
        height: 1200,
        description: "Cobalt study no.4",
      },
      {
        kind: "video",
        src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        poster: "/gallery/video-poster.png",
        alt: "Motion reel playing coastal footage",
        width: 1280,
        height: 720,
        description: "Motion reel — coastline, 0:32",
      },
    ],
  },
  {
    id: "elsewhere",
    section: "Elsewhere",
    title: "Warm light, late hours",
    body: "Travels through deserts and cities, chasing the last and first hours of the day.",
    media: [
      {
        kind: "image",
        src: "/gallery/desert-dunes.png",
        alt: "Golden desert dunes at sunset",
        width: 1200,
        height: 800,
        description: "Dunes at golden hour",
      },
      {
        kind: "image",
        src: "/gallery/city-night.png",
        alt: "City skyline reflected on a river at night",
        width: 900,
        height: 1200,
        description: "Riverside lights after midnight",
      },
    ],
  },
]

export const TOTAL_SLIDES = GALLERY_ENTRIES.reduce(
  (n, entry) => n + entry.media.length,
  0,
)