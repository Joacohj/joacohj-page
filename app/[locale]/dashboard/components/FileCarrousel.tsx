"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"

type MediaFile = {
    id: string
    original: File
    current: File
}

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
import { getFileId } from "./FileForm"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { ImageEditor } from "./ImageEditor"
import { MediaEditor } from "./media-editor/media-editor"

type FileCarrouselProps = {
    files: MediaFile[]
    setFiles: (files: MediaFile[]) => void
    api: CarouselApi
    setApi: (api: CarouselApi) => void
}

type FileUrl = {
    mediaFile: MediaFile
    url: string
}

export function FileCarrousel({
    files,
    setFiles,
    api,
    setApi
}: FileCarrouselProps) {
    const [current, setCurrent] = React.useState(0)
    const [muted, setMuted] = React.useState(true)
    const [pause, setPaused] = React.useState(false)
    const previousFilesLength = React.useRef(files.length)
    const videoRefs = React.useRef<
        Record<string, HTMLVideoElement>
    >({})
    React.useEffect(() => {
        if (!api) return

        const previousLength = previousFilesLength.current

        // Solo cuando se agrega un archivo
        if (files.length > previousLength) {
            requestAnimationFrame(() => {
                api.reInit()
                api.scrollTo(files.length - 1)
            })
        }

        previousFilesLength.current = files.length
    }, [files.length, api])
    const [fileUrls, setFileUrls] = React.useState<FileUrl[]>([])
    const handleSelectFile = (file: MediaFile) => {
        if (!api) return;

        const index = files.findIndex(
            (currentFile) =>
                currentFile.id === file.id
        );

        if (index === -1) return;

        api.scrollTo(index);
    };
    /*
     * Crear los ObjectURL cuando cambian los archivos
     */
    React.useEffect(() => {
        const urls = files.map((mediaFile) => ({
            mediaFile,
            url: URL.createObjectURL(mediaFile.current),
        }))

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFileUrls(urls)

        return () => {
            urls.forEach(({ url }) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [files])
    const [editingFile, setEditingFile] = React.useState<MediaFile | null>(null)
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
     * Limpiar referencias de videos que ya no existen
     */

    React.useEffect(() => {
        Object.values(videoRefs.current).forEach((video) => {
            if (!video) return

            if (pause) {
                video.pause()
            }
        })
    }, [pause])
    React.useEffect(() => {
        const currentIds = new Set(
            files.map((file) => file.id)
        )
        // eslint-disable-next-line react-hooks/set-state-in-effect
        // setCurrent(files.length - 1)
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

    }, [files])

    /*
     * Carousel
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
     * Cuando cambia pause, pausar/reproducir todos los videos
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
     * Eliminar archivo
     */
    function handleRemoveFile(mediaFileToRemove: MediaFile) {
        const id = mediaFileToRemove.id
        if (mediaFileToRemove == files[files.length - 1]) {
            setCurrent(current => current - 1)
        }
        const video = videoRefs.current[id]

        if (video) {
            video.pause()
            video.removeAttribute("src")
            video.load()

            delete videoRefs.current[id]
        }

        setFiles(
            files.filter((mediaFile) => mediaFile.id !== id)
        )


    }

    /*
     * Mutear/desmutear
     */
    function handleMuted() {
        setMuted((current) => !current)
    }

    /*
     * Cuando el video termina de cargar
     *
     * Esto es importante cuando el primer elemento
     * agregado es un video.
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

    return (
        <div>
            <Carousel
                setApi={setApi}
                className="w-full"
            >
                <CarouselContent className="w-full">

                    {fileUrls.map(({ mediaFile, url }) => {

                        const file = mediaFile.current
                        return (

                            <CarouselItem key={mediaFile.id}>
                                <Card className="m-px bg-transparent ring-0">
                                    <CardContent className="relative flex aspect-square h-full w-full items-center justify-center p-0">
                                        {file.type.startsWith("image/") ? (
                                            <Image
                                                className="h-full w-full rounded-xl object-cover object-center"
                                                src={url}
                                                width={1920}
                                                height={1080}
                                                alt={file.name}
                                            />
                                        ) : file.type.startsWith("video/") ? (
                                            <>
                                                <video
                                                    onClick={() => setPaused((prev) => !prev)}
                                                    className="h-full w-full rounded-xl object-cover object-center"
                                                    src={url}
                                                    muted={muted}
                                                    loop
                                                    playsInline
                                                    ref={(element) => {
                                                        if (element) {
                                                            videoRefs.current[mediaFile.id] = element
                                                        } else {
                                                            delete videoRefs.current[mediaFile.id]
                                                        }
                                                    }}
                                                />

                                                {/* Indicador de pausa */}
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
                                            {file.type.startsWith("video/") && (
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
                                            {file.type.startsWith("image/") && <Button
                                                type="button"
                                                variant="outline"
                                                size="icon-sm"
                                                onClick={() => setEditingFile(mediaFile)}
                                            >
                                                <PencilIcon />
                                                <span className="sr-only">Edit media</span>
                                            </Button>}
                                            {file.type.startsWith("image/") && (
                                                <Dialog
                                                    open={editingFile !== null}
                                                    onOpenChange={(open) => {
                                                        if (!open) {
                                                            setEditingFile(null)
                                                        }
                                                    }}
                                                >
                                                    <DialogContent className="flex h-[85vh] max-h-[720px] w-full max-w-3xl flex-col overflow-hidden">
                                                        {editingFile && (
                                                            <MediaEditor
                                                                originalFile={editingFile.original}
                                                                file={editingFile.current}
                                                                onSave={(editedFile) => {
                                                                    setFiles(
                                                                        files.map((mediaFile) =>
                                                                            mediaFile.id === editingFile.id
                                                                                ? {
                                                                                    ...mediaFile,
                                                                                    current: editedFile,
                                                                                }
                                                                                : mediaFile
                                                                        )
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
                                                    handleRemoveFile(mediaFile)
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

            {files.length > 0 && (
                <div className="py-1 pb-3 text-center text-sm text-muted-foreground">
                    {current} of {files.length}
                </div>
            )}
        </div>
    )
}