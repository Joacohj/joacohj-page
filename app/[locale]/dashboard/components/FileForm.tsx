import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ImageIcon, TrashIcon, UploadIcon } from "@radix-ui/react-icons";
import { fi } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    DndContext,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
} from '@dnd-kit/sortable';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldTitle,
} from "@/components/ui/field"
import { SortableFile } from "./SortableFile";
import { FileCarrousel } from "./FileCarrousel";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MAX_FILES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "@/utils/constants";
import React from "react";
import { CarouselApi } from "@/components/ui/carousel";
export const getFileId = (file: File) =>
    `${file.name}-${file.lastModified}`;
export default function FileForm() {
    const [scrolled, setScrolled] = useState(false);
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrolled(e.currentTarget.scrollTop > 0);
    };
    const [api, setApi] = React.useState<CarouselApi>()
    const videoRefs = React.useRef<
        Record<string, HTMLVideoElement>
    >({})
    const [isFileSelected, setIsFileSelected] = useState<boolean>(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": [],
            "video/*": [],
        },

        validator: (file) => {
            if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
                return {
                    code: "image-too-large",
                    message: "Las imágenes no pueden superar los 5 MB.",
                };
            }

            if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
                return {
                    code: "video-too-large",
                    message: "Los videos no pueden superar los 50 MB.",
                };
            }

            return null;
        },

        onDrop: (acceptedFiles, fileRejections) => {
            // Archivos rechazados por tipo/tamaño
            if (fileRejections.length > 0) {
                fileRejections.forEach(({ file, errors }) => {
                    const message = errors
                        .map(error => error.message)
                        .join(", ");

                    toast.add({
                        type: "error",
                        description: `"${file.name}" no pudo ser agregado: ${message}`,
                        priority: "high",
                    });
                });
            }

            const existingNames = new Set(
                files.map(file => file.name)
            );

            // Archivos que ya existen
            const duplicatedFiles = acceptedFiles.filter(
                file => existingNames.has(file.name)
            );

            // Archivos nuevos
            const newFiles = acceptedFiles.filter(
                file => !existingNames.has(file.name)
            );

            // Lugares disponibles
            const remainingSlots = MAX_FILES - files.length;

            // Archivos que entran
            const filesToAdd = newFiles.slice(0, remainingSlots);

            // Archivos que exceden el límite
            const filesRejectedByLimit = newFiles.slice(remainingSlots);

            if (filesToAdd.length > 0) {
                setFiles(current => [
                    ...current,
                    ...filesToAdd,
                ]);

                setIsFileSelected(true);
            }

            // Archivos que quedaron fuera por superar el límite
            filesRejectedByLimit.forEach(file => {
                toast.add({
                    type: "error",
                    description: `No se pudo subir el archivo "${file.name}" porque alcanzaste el límite de ${MAX_FILES} archivos.`,
                    priority: "high",
                });
            });

            // Archivos duplicados
            duplicatedFiles.forEach(file => {
                toast.add({
                    type: "error",
                    description: `El archivo "${file.name}" ya fue agregado.`,
                    priority: "high",
                });
            });
        },
    });


    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = files.findIndex(
            (file) => getFileId(file) === active.id
        );

        const newIndex = files.findIndex(
            (file) => getFileId(file) === over.id
        );

        setFiles((current) =>
            arrayMove(current, oldIndex, newIndex)
        );
    }

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

    return <form >
        {files.length == 0 && <div  {...getRootProps()} className={cn("w-full h-[300px]  flex justify-center items-center border-[3px] border-dashed border-accent rounded-xl relative transition-colors", isDragActive ? 'border-input bg-accent' : '')}>
            <div className=" flex justify-center items-center flex-col absolute">
                <div className="p-3 bg-accent text-foreground rounded-md">
                    <ImageIcon className="text-muted-foreground" />
                </div>
                <p className="mt-2 text-muted-foreground">Drag & Drop Files Here</p>
                <div className="flex gap-5 mt-3 w-full px-10 justify-center items-center">
                    <Separator className="h-0.5 bg-accent" />
                    <p className="text-sm text-muted-foreground">OR</p>
                    <Separator className=" h-0.5 bg-accent" />
                </div>
                <div className="mt-5">
                    <Button variant={'outline'} className={'relative text-muted-foreground flex items-center gap-2'}>
                        <UploadIcon /> Select from computer
                        <input accept="" ref={fileInputRef} {...getInputProps()} type="file" multiple className="absolute inset-0 opacity-0" />
                    </Button>
                </div>
            </div>
        </div>}
        {files.length > 0 && <div className="w-full grid xl:grid-cols-[1fr_550px] gap-5">
            <div className="order-2 xl:order-1">

                <div onScroll={handleScroll} className="rounded-md  xl:px-2 pb-10 overflow-x-hidden overflow-y-auto scrollbar-none max-h-[450px]">
                    <div
                        className={cn(
                            "sticky px-2 flex items-center top-0 z-10 py-3 mt-5 transition-all border border-accent  mb-4 duration-300",
                            scrolled
                                ? "bg-background/80 backdrop-blur-md  rounded-b-xl"
                                : "bg-transparent rounded-md"
                        )}
                    >
                        <p className="py-2 text-xl text-muted-foreground px-2 font-light">Move your files to order them</p>
                    </div>
                    <DndContext onDragEnd={handleDragEnd}>
                        <SortableContext items={files.map((file) => getFileId(file))}
                        >
                            <div className="flex flex-col gap-5">
                                {files.map((file) => (
                                    <SortableFile
                                        
                                        onSelect={(file) => {
                                            const index = files.findIndex(
                                                (currentFile) =>
                                                    getFileId(currentFile) === getFileId(file)
                                            );

                                            if (index !== -1) {
                                                api?.scrollTo(index);
                                            }
                                        }}
                                        files={files}
                                        setFiles={setFiles}
                                        key={getFileId(file)}
                                        file={file}
                                        onRemove={handleRemoveFile}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                <div {...getRootProps()} className="w-full py-5 flex justify-center">
                    <Button variant={'outline'} className={'relative py-5 flex items-center gap-2'}>
                        <UploadIcon /> Add more files
                        <input {...getInputProps()} type="file" multiple className="absolute inset-0 py-5 opacity" />
                    </Button>
                </div>
            </div>
            <div className="order-1 xl:order-1 w-full flex justify-center relative xl:max-h-[500px] overflow-auto scrollbar-none  ">
                <div className="flex flex-col xl:px-15">
                    <div className="w-full h-full flex justify-center items-center">
                        <FileCarrousel api={api} setApi={setApi} setFiles={setFiles} files={files} />
                    </div>
                    <div>
                        <p className="text-xl">Publication Settings</p>
                        <p className="text-muted-foreground">Lorem ipsum dolor sit.</p>
                    </div>
                    <Separator className="h-0.5 w-full bg-accent my-3" />
                    <div>
                        <FieldGroup>
                            <FieldGroup>
                                <FieldLabel htmlFor="title">Title</FieldLabel>
                                <InputGroup className="py-5">
                                    <InputGroupInput placeholder="publication title" id='title' type="text" />
                                </InputGroup>
                            </FieldGroup>
                            <FieldGroup>
                                <FieldLabel htmlFor="title">Description</FieldLabel>
                                <Textarea className="resize-none" placeholder="publication description"></Textarea>
                            </FieldGroup>
                            <FieldGroup>
                                <FieldLabel>File Size</FieldLabel>
                                <RadioGroup defaultValue="small" className="max-w-sm flex">
                                    <FieldLabel className="max-w-fit" htmlFor="small">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Small</FieldTitle>
                                                <FieldDescription>
                                                    A small file size
                                                </FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value="small" id="small" />
                                        </Field>
                                    </FieldLabel>
                                    <FieldLabel className="max-w-fit" htmlFor="medium">
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Medium</FieldTitle>
                                                <FieldDescription>A medium file size</FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value="medium" id="medium" />
                                        </Field>
                                    </FieldLabel>
                                    <FieldLabel className="max-w-fit" htmlFor="large">
                                        <Field className="w-fit" orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>Large</FieldTitle>
                                                <FieldDescription>
                                                    A large file size
                                                </FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem value="large" id="large" />
                                        </Field>
                                    </FieldLabel>
                                </RadioGroup>
                            </FieldGroup>
                            <Separator className={"w-full h-0.5 bg-accent my-3"} />
                            <FieldGroup>
                                <Field className="w-fit" aria-required>

                                    <FieldLabel aria-required htmlFor="category">Visibility</FieldLabel>
                                    <Combobox items={['Public', 'Private']} defaultValue={'Public'}>
                                        <ComboboxTrigger render={<Button variant="outline" className="w-64 justify-between font-normal"><ComboboxValue /> <ChevronDown /></Button>} />
                                        <ComboboxContent >
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(item) => (
                                                    <ComboboxItem key={item} value={item}>
                                                        {item}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                            </FieldGroup>
                            <FieldGroup>
                                <Field className="w-fit" aria-required>

                                    <FieldLabel aria-required htmlFor="category">Topic</FieldLabel>
                                    <Combobox items={['Everything', 'Works', 'Portraits', 'Collections']} defaultValue={'Everything'}>
                                        <ComboboxTrigger render={<Button variant="outline" className="w-64 justify-between font-normal"><ComboboxValue /> <ChevronDown /></Button>} />
                                        <ComboboxContent >
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(item) => (
                                                    <ComboboxItem key={item} value={item}>
                                                        {item}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                                <Separator className={"h-0.5 bg-accent w-full"} />

                                <Field orientation={'horizontal'}>

                                    <Checkbox name="allow_interactions" id="allow_interactions" />
                                    <FieldLabel htmlFor="allow_interactions">
                                        Allow Interactions
                                    </FieldLabel>
                                </Field>
                            </FieldGroup>
                        </FieldGroup>
                        <Button size={"lg"} className={"w-full my-5 py-5"} type="submit">Create Publication</Button>
                    </div>

                </div>

            </div>
        </div>}


    </form>
}