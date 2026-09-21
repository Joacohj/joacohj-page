"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "@radix-ui/react-icons"
import {
    Pause,
    PencilIcon,
    Volume1Icon,
    VolumeOffIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
    MediaFile,
    MediaItem,
} from "@/features/post/post-form"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MediaEditor } from "./media-editor/media-editor"

type MediaCarrouselProps = {
    medias: MediaItem[]
    setMedias: React.Dispatch<React.SetStateAction<MediaItem[]>>
    api: CarouselApi
    setApi: (api: CarouselApi) => void
}

type FileUrl = {
    mediaFile: MediaFile
    url: string
}

export function MediaCarrousel({
    medias,
    setMedias,
    api,
    setApi,
}: MediaCarrouselProps) {

    const [current, setCurrent] = React.useState(0)
    const [muted, setMuted] = React.useState(true)
    const [pause, setPaused] = React.useState(false)

    const previousMediasLength = React.useRef(medias.length)

    const videoRefs = React.useRef<
        Record<string, HTMLVideoElement>
    >({})

    const [fileUrls, setFileUrls] = React.useState<FileUrl[]>([])

    const [editingFile, setEditingFile] =
        React.useState<MediaFile | null>(null)

    React.useEffect(() => {
        if (!api) return

        requestAnimationFrame(() => {
            api.reInit()

            const maxIndex = Math.max(0, medias.length - 1)
            const selectedIndex = Math.min(
                api.selectedScrollSnap(),
                maxIndex
            )

            api.scrollTo(selectedIndex, true)
        })

        previousMediasLength.current = medias.length
    }, [api, medias.length])
    /*
     * Cuando se agrega un nuevo media,
     * llevar el carousel al último elemento.
     */
    React.useEffect(() => {
        if (!api) return

        const previousLength = previousMediasLength.current

        if (medias.length > previousLength) {
            requestAnimationFrame(() => {
                api.reInit()
                api.scrollTo(medias.length - 1)
            })
        }

        previousMediasLength.current = medias.length
    }, [medias.length, api])


    /*
     * Crear ObjectURLs solamente para archivos locales.
     */
    React.useEffect(() => {
        const urls = medias
            .filter(
                (media): media is Extract<MediaItem, { type: "file" }> =>
                    media.type === "file"
            )
            .map((media) => ({
                mediaFile: media.file,
                url: URL.createObjectURL(media.file.current),
            }))

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFileUrls(urls)

        return () => {
            urls.forEach(({ url }) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [medias])


    /*
     * Autoplay / pause de videos locales.
     */
    React.useEffect(() => {

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    const video = entry.target as HTMLVideoElement

                    if (entry.isIntersecting && !pause) {
                        video.play().catch(() => { })
                    } else {
                        video.pause()
                    }

                })
            },
            {
                threshold: 0.6,
            }
        )

        Object.values(videoRefs.current).forEach((video) => {
            observer.observe(video)
        })

        return () => {
            observer.disconnect()
        }

    }, [fileUrls, pause])


    /*
     * Pausar todos los videos cuando pause cambia.
     */
    React.useEffect(() => {

        Object.values(videoRefs.current).forEach((video) => {

            if (!video) return

            if (pause) {
                video.pause()
            } else {
                video.play().catch(() => { })
            }

        })

    }, [pause])


    /*
     * Limpiar referencias de videos eliminados.
     */
    React.useEffect(() => {

        const currentIds = new Set(
            medias
                .filter(
                    (media): media is Extract<MediaItem, { type: "file" }> =>
                        media.type === "file"
                )
                .map((media) => media.id)
        )

        Object.entries(videoRefs.current).forEach(
            ([id, video]) => {

                if (!currentIds.has(id)) {

                    video.pause()
                    video.removeAttribute("src")
                    video.load()

                    delete videoRefs.current[id]
                }

            }
        )

    }, [medias])


    /*
     * Actualizar slide actual.
     */
    React.useEffect(() => {

        if (!api) return

        const updateCurrent = () => {
            setCurrent(api.selectedScrollSnap() + 1)
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", updateCurrent)

        return () => {
            api.off("select", updateCurrent)
        }

    }, [api])


    /*
     * Eliminar media.
     */
    function handleRemoveMedia(mediaToRemove: MediaItem) {

        const id = mediaToRemove.id

        const index = medias.findIndex(
            (media) => media.id === id
        )

        if (index === -1) return

        /*
         * Si eliminamos el último elemento,
         * corregimos el índice del carousel.
         */
        if (index === medias.length - 1) {
            setCurrent((current) => Math.max(1, current - 1))
        }

        /*
         * Si era un video local,
         * limpiamos su referencia.
         */
        if (mediaToRemove.type === "file") {

            const video = videoRefs.current[id]

            if (video) {

                video.pause()
                video.removeAttribute("src")
                video.load()

                delete videoRefs.current[id]
            }
        }

        setMedias((current) =>
            current.filter(
                (media) => media.id !== id
            )
        )
    }


    /*
     * Mutear / desmutear videos locales.
     */
    function handleMuted() {
        setMuted((current) => !current)
    }


    /*
     * Cuando un video local termina de cargar.
     */
    function handleVideoLoaded(
        event: React.SyntheticEvent<HTMLVideoElement>
    ) {

        const video = event.currentTarget

        if (pause) {
            video.pause()
        } else {
            video.play().catch(() => { })
        }
    }


    /*
     * Editar una imagen.
     */
    function handleEditFile(media: MediaItem) {

        if (media.type !== "file") return

        if (!media.file.current.type.startsWith("image/")) {
            return
        }

        setEditingFile(media.file)
    }


    return (
        <div>

            <Carousel
                setApi={setApi}
                className="w-full"
            >

                <CarouselContent className="w-full">

                    {medias.map((media) => {

                        /*
                         * ==========================
                         * YOUTUBE
                         * ==========================
                         */

                        if (media.type === "youtube") {

                            return (
                                <CarouselItem key={media.id}>

                                    <Card className="m-px flex items-center bg-transparent ring-0">

                                        <CardContent className="relative flex w-full  items-center justify-center p-0">
                                            <div className="relative aspect-video w-full min-w-75 max-w-full overflow-hidden rounded-xl">
                                                <iframe
                                                    className="absolute inset-0 size-full"
                                                    src={`https://www.youtube.com/embed/${media.videoId}`}
                                                    title="YouTube video"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                            </div>

                                            <div className="absolute bottom-3 right-3 flex gap-2 rounded-md bg-accent/80 p-1 px-2">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => handleRemoveMedia(media)}
                                                    size="icon-sm"
                                                >
                                                    <TrashIcon />
                                                </Button>
                                            </div>
                                        </CardContent>

                                    </Card>

                                </CarouselItem>
                            )
                        }


                        /*
                         * ==========================
                         * ARCHIVO LOCAL
                         * ==========================
                         */

                        const file = media.file
                        const fileUrl = fileUrls.find(
                            (item) =>
                                item.mediaFile.id === file.id
                        )

                        if (!fileUrl) {
                            return null
                        }

                        const url = fileUrl.url

                        return (
                            <CarouselItem key={media.id}>

                                <Card className="m-px bg-transparent ring-0">

                                    <CardContent className="relative flex aspect-square h-full w-full items-center justify-center p-0">

                                        {file.current.type.startsWith("image/") ? (

                                            <Image
                                                className="h-full w-full rounded-xl object-cover object-center"
                                                src={url}
                                                width={1920}
                                                height={1080}
                                                alt={file.current.name}
                                            />

                                        ) : file.current.type.startsWith("video/") ? (

                                            <>

                                                <video
                                                    onClick={() =>
                                                        setPaused((prev) => !prev)
                                                    }
                                                    onLoadedData={handleVideoLoaded}
                                                    className="h-full w-full rounded-xl object-cover object-center"
                                                    src={url}
                                                    muted={muted}
                                                    loop
                                                    playsInline
                                                    ref={(element) => {

                                                        if (element) {
                                                            videoRefs.current[media.id] = element
                                                        } else {
                                                            delete videoRefs.current[media.id]
                                                        }

                                                    }}
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

                                                        <Pause className="size-6 fill-current" />

                                                    </div>

                                                </div>

                                            </>

                                        ) : null}


                                        {/* Controles */}

                                        <div className="absolute bottom-3 right-3 flex gap-2 rounded-md bg-accent/80 p-1 px-2">

                                            {file.current.type.startsWith("video/") && (

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleMuted}
                                                    size="icon-sm"
                                                >

                                                    {muted ? (
                                                        <VolumeOffIcon />
                                                    ) : (
                                                        <Volume1Icon />
                                                    )}

                                                </Button>

                                            )}


                                            {file.current.type.startsWith("image/") && (

                                                <Dialog
                                                    open={
                                                        editingFile?.id === file.id
                                                    }
                                                    onOpenChange={(open) => {

                                                        if (!open) {
                                                            setEditingFile(null)
                                                        }

                                                    }}
                                                >

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon-sm"
                                                        onClick={() =>
                                                            handleEditFile(media)
                                                        }
                                                    >
                                                        <PencilIcon />

                                                        <span className="sr-only">
                                                            Edit media
                                                        </span>
                                                    </Button>

                                                    <DialogContent className="flex h-[85vh] max-h-180 w-full max-w-3xl flex-col overflow-hidden">

                                                        {editingFile && (

                                                            <MediaEditor
                                                                originalFile={
                                                                    editingFile.original
                                                                }
                                                                file={
                                                                    editingFile.current
                                                                }
                                                                onSave={(editedFile) => {

                                                                    setMedias((current) =>
                                                                        current.map((item) => {

                                                                            if (
                                                                                item.type === "file" &&
                                                                                item.file.id === editingFile.id
                                                                            ) {

                                                                                return {
                                                                                    ...item,
                                                                                    file: {
                                                                                        ...item.file,
                                                                                        current: editedFile,
                                                                                    },
                                                                                }
                                                                            }

                                                                            return item
                                                                        })
                                                                    )

                                                                    setEditingFile(null)
                                                                }}
                                                                onCancel={() => {
                                                                    setEditingFile(null)
                                                                }}
                                                            />

                                                        )}

                                                    </DialogContent>

                                                </Dialog>

                                            )}


                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleRemoveMedia(media)
                                                }
                                                size="icon-sm"
                                            >
                                                <TrashIcon />
                                            </Button>

                                        </div>

                                    </CardContent>

                                </Card>

                            </CarouselItem>
                        )

                    })}

                </CarouselContent>

            </Carousel>


            {medias.length > 0 && (

                <div className="py-1 pb-3 text-center text-sm text-muted-foreground">
                    {current} of {medias.length}
                </div>

            )}

        </div>
    )
}