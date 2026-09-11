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

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "@radix-ui/react-icons"
import {
    Pause,
    Volume1Icon,
    VolumeOffIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { getFileId } from "./FileForm"

type FileCarrouselProps = {
    files: File[]
    setFiles: (files: File[]) => void
    api: CarouselApi,
    setApi: (api: CarouselApi) => void
}

type FileUrl = {
    file: File
    id: string
    url: string,

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
    const handleSelectFile = (file: File) => {
        if (!api) return;

        const index = files.findIndex(
            (currentFile) =>
                getFileId(currentFile) === getFileId(file)
        );

        if (index === -1) return;

        api.scrollTo(index);
    };
    /*
     * Crear los ObjectURL cuando cambian los archivos
     */
    React.useEffect(() => {
        const urls = files.map((file) => ({
            file,
            id: getFileId(file),
            url: URL.createObjectURL(file),
        }))

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFileUrls(urls)

        return () => {
            urls.forEach(({ url }) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [files])
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
            files.map((file) => getFileId(file))
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
    function handleRemoveFile(fileToRemove: File) {
        const id = getFileId(fileToRemove)

        const video = videoRefs.current[id]

        if (video) {
            video.pause()
            video.removeAttribute("src")
            video.load()

            delete videoRefs.current[id]
        }

        setFiles(
            files.filter((file) => file !== fileToRemove)
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
                <CarouselContent className="xl:w-[370px]">
                    {fileUrls.map(({ file, id, url }) => (
                        <CarouselItem key={id}>
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
                                                        videoRefs.current[id] = element
                                                    } else {
                                                        delete videoRefs.current[id]
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

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() =>
                                                handleRemoveFile(file)
                                            }
                                            size="icon-sm"
                                        >
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {files.length > 1 && (
                    <>
                        <CarouselPrevious />
                        <CarouselNext />
                    </>
                )}
            </Carousel>

            {files.length > 0 && (
                <div className="py-1 pb-3 text-center text-sm text-muted-foreground">
                    {current} of {files.length}
                </div>
            )}
        </div>
    )
}