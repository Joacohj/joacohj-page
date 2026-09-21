import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { cn, getMediaMetadata } from "@/lib/utils";
import { ImageIcon, PaperPlaneIcon, UploadIcon } from "@radix-ui/react-icons";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  createPostSchema,
  type CreatePostFormValues,
} from "@/lib/schemas/post";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle,
} from "@/components/ui/field";

export type MediaFile = {
  id: string;
  original: File;
  current: File;
};

export type MediaItem =
  | {
    id: string;
    type: "file";
    file: MediaFile;
  }
  | {
    id: string;
    type: "youtube";
    url: string;
    videoId: string;
  };

import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MAX_FILES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "@/hooks/utils/constants";
import React from "react";
import { CarouselApi } from "@/components/ui/carousel";
import { useSession } from "@/lib/auth-client";
import { createPost } from "@/actions";
import { Spinner } from "@/components/ui/spinner";
import { getYoutubeVideoId } from "@/hooks/utils/helpers";
import { MediaCarrousel } from "../media/media-carousel";
import { SortableMedia } from "../media/sortable-media";
import { unstable_rethrow } from "next/navigation";

export const getFileId = (file: MediaFile) => file.id;


type Category = {
  id: string;
  title: string;
  description: string;
};

type Topic = {
  id: string;
  title: string;
  description: string;
};



export default function FileForm() {
  const { data } = useSession();
  const [medias, setMedias] = useState<MediaItem[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  async function getData() {
    try {
      const responses = await Promise.all([
        fetch("http://localhost:3000/api/data/categories", {
          cache: "no-store",
        }),
        fetch("http://localhost:3000/api/data/topics", {
          cache: "no-store",
        }),
      ]);

      const [categoriesData, topicsData] = await Promise.all(
        responses.map((response) => response.json()),
      );

      setCategories(
        categoriesData.categories.map((category: Category) => ({
          title: category.title,
          id: category.id,
          description: category.description,
        })),
      );

      setTopics(
        topicsData.topics.map((topic: Topic) => ({
          title: topic.title,
          id: topic.id,
          description: topic.description,
        })),
      );
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getData();
  }, []);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),

    defaultValues: {
      title: "",
      description: "",
      fileSize: "small",
      visibility: "public",
      allowInteractions: "all",
      categoryId: "",
      topicIds: [],
    },
  });
  const anchor = useComboboxAnchor();
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 0);
  };
  const [api, setApi] = React.useState<CarouselApi>();
  const [url, setUrl] = useState<string>("")
  const videoRefs = React.useRef<Record<string, HTMLVideoElement>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
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
            .map((error) => error.message)
            .join(", ");

          toast.add({
            type: "error",
            description: `"${file.name}" no pudo ser agregado: ${message}`,
            priority: "high",
          });
        });
      }

      // Obtener solamente los archivos que ya existen
      const existingNames = new Set(
        medias
          .filter((media): media is Extract<MediaItem, { type: "file" }> =>
            media.type === "file"
          )
          .map((media) => media.file.current.name)
      );

      // Duplicados
      const duplicatedFiles = acceptedFiles.filter((file) =>
        existingNames.has(file.name)
      );

      // Archivos nuevos
      const newFiles = acceptedFiles.filter(
        (file) => !existingNames.has(file.name)
      );

      // Espacios disponibles
      const remainingSlots = MAX_FILES - medias.length;

      // Archivos que entran
      const filesToAdd = newFiles.slice(0, remainingSlots);

      // Archivos que exceden el límite
      const filesRejectedByLimit = newFiles.slice(remainingSlots);

      if (filesToAdd.length > 0) {
        const newMedia: MediaItem[] = filesToAdd.map((file) => ({
          id: crypto.randomUUID(),
          type: "file",
          file: {
            id: crypto.randomUUID(),
            original: file,
            current: file,
          },
        }));

        setMedias((current) => [
          ...current,
          ...newMedia,
        ]);
      }

      // Límite
      filesRejectedByLimit.forEach((file) => {
        toast.add({
          type: "error",
          description: `No se pudo agregar "${file.name}" porque alcanzaste el límite de ${MAX_FILES} archivos.`,
          priority: "high",
        });
      });

      // Duplicados
      duplicatedFiles.forEach((file) => {
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

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = medias.findIndex(
      (media) => media.id === active.id
    );

    const newIndex = medias.findIndex(
      (media) => media.id === over.id
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    setMedias((current) =>
      arrayMove(current, oldIndex, newIndex)
    );
  }
  async function onSubmit(values: CreatePostFormValues) {
    if (medias.length === 0) {
      toast.add({
        type: "error",
        description: "Debés agregar al menos un archivo o video de YouTube.",
        priority: "high",
      });

      return;
    }

    try {
      const postMedia = await Promise.all(
        medias.map(async (item, index) => {
          // ==========================
          // YOUTUBE
          // ==========================

          if (item.type === "youtube") {
            return {
              type: "youtube" as const,
              url: item.url,
              videoId: item.videoId,
              order: index,
            };
          }

          // ==========================
          // ARCHIVO
          // ==========================

          const metadata = await getMediaMetadata(
            item.file.current
          );

          return {
            type: item.file.current.type.startsWith("video/")
              ? ("video" as const)
              : ("image" as const),

            file: item.file.current,

            width: metadata.width,
            height: metadata.height,
            aspectRatio: metadata.aspectRatio,

            alt: values.title,

            order: index,

            ...(metadata.poster
              ? {
                poster: metadata.poster,
              }
              : {}),
          };
        })
      );

      const post = {
        allowInteractions: values.allowInteractions,
        visibility: values.visibility,
        fileSize: values.fileSize,

        userId: data?.user.id,

        title: values.title,
        description: values.description,

        categoryId: values.categoryId,
        topicIds: values.topicIds,

        media: postMedia,
      };

      await createPost(post);
    } catch (error) {
      unstable_rethrow(error); // si es redirect/notFound, lo relanza y no sigue

      console.error(error);
      toast.add({
        type: "error",
        description: "No se pudo preparar uno de los archivos.",
        priority: "high",
      });
    }
  }

  function handleUrlSubmit() {
    const trimmedUrl = url.trim();

    const videoId = getYoutubeVideoId(trimmedUrl);

    if (!videoId) {
      toast.add({
        type: "error",
        description: "The URL isn't a YouTube video URL.",
        priority: "high",
      });

      return;
    }

    if (medias.length >= MAX_FILES) {
      toast.add({
        type: "error",
        description: `You can only add up to ${MAX_FILES} media items.`,
        priority: "high",
      });

      return;
    }

    const alreadyExists = medias.some(
      (media) =>
        media.type === "youtube" &&
        media.videoId === videoId
    );

    if (alreadyExists) {
      toast.add({
        type: "error",
        description: "This YouTube video has already been added.",
        priority: "high",
      });

      return;
    }

    setMedias((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: "youtube",
        url: trimmedUrl,
        videoId,
      },
    ]);

    setUrl("");
  }

  function handleRemoveMedia(mediaToRemove: MediaItem) {
    const id = mediaToRemove.id;

    // Si era un video local, limpiar su referencia
    if (mediaToRemove.type === "file") {
      const video = videoRefs.current[id];

      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();

        delete videoRefs.current[id];
      }
    }

    setMedias((current) =>
      current.filter((media) => media.id !== id)
    );
  }

  function handleSelectMedia(media: MediaItem) {
    if (!api) return;

    const index = medias.findIndex(
      (currentMedia) => currentMedia.id === media.id
    );

    if (index === -1) return;

    api.scrollTo(index);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, (error) => {
      console.log(error)
    })}>
      {medias.length === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "w-full h-75  flex justify-center items-center border-[3px] border-dashed border-accent rounded-xl relative transition-colors",
            isDragActive ? "border-input bg-accent" : "",
          )}
        >
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
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant={"outline"}
                className={
                  "relative text-muted-foreground flex items-center gap-2"
                }
              >
                <UploadIcon /> Select from computer
                <input
                  accept=""
                  ref={fileInputRef}
                  {...getInputProps()}
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0"
                />
              </Button>
              <InputGroup onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}>
                <InputGroupInput value={url} onChange={({ target }) => setUrl(target.value)} type="text" placeholder="or add a youtube url..." />
                <InputGroupAddon align={'inline-end'}>
                  <Button
                    type="button"
                    onClick={() => handleUrlSubmit()}
                    variant="ghost"
                    size="icon-sm"
                  >
                    <PaperPlaneIcon />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
      )}
      {(medias.length > 0) && (
        <div className="w-full grid xl:grid-cols-[1fr_550px] gap-5">
          <div className="order-2 xl:order-1 w-full xl:w-full sm:px-0">
            <div
              onScroll={handleScroll}
              className="rounded-md  xl:px-2 pb-10 overflow-x-hidden overflow-y-auto scrollbar-none max-h-112.5"
            >
              <div
                className={cn(
                  "sticky px-2 flex items-center top-0 z-10 py-3 mt-5 transition-all border border-accent  mb-4 duration-300",
                  scrolled
                    ? "bg-background/80 backdrop-blur-md  rounded-b-xl"
                    : "bg-transparent rounded-md",
                )}
              >
                <p className="py-2 text-xl text-muted-foreground px-2 font-light">
                  Move your files to order them
                </p>
              </div>
              <DndContext onDragEnd={handleDragEnd}>
                <SortableContext
                  items={medias.map((media) => media.id)}
                >
                  <div className="flex flex-col gap-5">
                    {medias.map((media) => (
                      <SortableMedia
                        key={media.id}
                        media={media}
                        medias={medias}
                        setMedias={setMedias}
                        onRemove={handleRemoveMedia}
                        onSelect={handleSelectMedia}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            <div
              {...getRootProps()}
              className={cn(
                "w-full py-5 flex justify-center items-center flex-col gap-3",
                medias.length >= MAX_FILES ? "hidden" : "flex",
              )}
            >
              <Button
                variant={"outline"}
                className={
                  "w-full xl:w-fit relative py-5 flex items-center gap-2"
                }
              >
                <UploadIcon /> Add more files
                <input
                  {...getInputProps()}
                  type="file"
                  multiple
                  className="absolute inset-0 py-5 opacity"
                />
              </Button>
              <InputGroup className="w-fit" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}>
                <InputGroupInput value={url} onChange={({ target }) => setUrl(target.value)} type="text" placeholder="or add a youtube url..." />
                <InputGroupAddon align={'inline-end'}>
                  <Button
                    type="button"
                    onClick={() => handleUrlSubmit()}
                    variant="ghost"
                    size="icon-sm"
                  >
                    <PaperPlaneIcon />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
          <div className="order-1 xl:order-1 w-full flex xl:justify-center relative xl:max-h-125 overflow-auto scrollbar-none">
            <div className="flex w-full flex-col xl:px-15 h-auto">
              <div className="w-full h-full flex justify-center items-center">
                <MediaCarrousel
                  medias={medias}
                  setMedias={setMedias}
                  api={api}
                  setApi={setApi}
                />
              </div>
              <div>
                <p className="text-xl">Publication Settings</p>
                <p className="text-muted-foreground">Lorem ipsum dolor sit.</p>
              </div>
              <Separator className="h-0.5 w-full bg-accent my-3" />
              <div className="flex flex-col w-full">
                <FieldGroup className="w-full p-3 rounded-sm">
                  <FieldGroup className="w-full">
                    <FieldLabel htmlFor="title">Title</FieldLabel>

                    <InputGroup className="py-5">
                      <InputGroupInput
                        {...register("title")}
                        placeholder="publication title"
                        id="title"
                        type="text"
                      />
                    </InputGroup>
                    <FieldError>
                      {errors.title && (
                        <p className="text-sm text-destructive">
                          {errors.title.message}
                        </p>
                      )}
                    </FieldError>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="title">Description</FieldLabel>
                    <Textarea
                      {...register("description")}
                      className="resize-none"
                      placeholder="publication description"
                    />

                    <FieldError>
                      {errors.description && (
                        <p className="text-sm text-destructive">
                          {errors.description.message}
                        </p>
                      )}
                    </FieldError>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>File Size</FieldLabel>
                    <Controller
                      name="fileSize"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="max-w-sm flex"
                        >
                          <FieldLabel className="max-w-fit">
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

                          <FieldLabel className="max-w-fit">
                            <Field orientation="horizontal">
                              <FieldContent>
                                <FieldTitle>Medium</FieldTitle>
                                <FieldDescription>
                                  A medium file size
                                </FieldDescription>
                              </FieldContent>

                              <RadioGroupItem value="medium" id="medium" />
                            </Field>
                          </FieldLabel>

                          <FieldLabel className="max-w-fit">
                            <Field orientation="horizontal">
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
                      )}
                    />
                  </FieldGroup>
                  <Separator className={"w-full h-0.5 bg-accent my-3"} />
                  <FieldLabel htmlFor="visibility">Visibility</FieldLabel>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        id="visibility"
                        items={["Public", "Private"]}
                        value={field.value === "public" ? "Public" : "Private"}
                        onValueChange={(value) => {
                          field.onChange(
                            value === "Public" ? "public" : "private",
                          );
                        }}
                      >
                        <ComboboxTrigger
                          render={
                            <Button
                              variant="outline"
                              className="w-64 justify-between font-normal"
                            >
                              <ComboboxValue />
                              <ChevronDown />
                            </Button>
                          }
                        />

                        <ComboboxContent>
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
                    )}
                  />
                  <FieldGroup>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          id="category"
                          items={categories.map((category) => ({
                            label: category.title,
                            value: category.id,
                          }))}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <ComboboxTrigger
                            render={
                              <Button
                                variant="outline"
                                className="w-64 justify-between font-normal"
                              >
                                <p className={field.value ? 'hidden' : 'inline'}>Select category</p>
                                {field.value && <ComboboxValue placeholder="Select Category" />}
                                <ChevronDown />
                              </Button>
                            }
                          />
                          <ComboboxContent>
                            <ComboboxEmpty>No Categories found.</ComboboxEmpty>
                            <ComboboxList>
                              {(item) => (
                                <ComboboxItem
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      )}
                    />

                    {errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {errors.categoryId.message}
                      </p>
                    )}
                    <Separator className={"h-0.5 bg-accent w-full"} />

                    <Field orientation={"horizontal"}>
                      <Controller
                        name="allowInteractions"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value === "all"}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? "all" : "none");
                            }}
                          />
                        )}
                      />
                      <FieldLabel htmlFor="allow_interactions">
                        Allow Interactions
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="topics">Topics</FieldLabel>
                    <Controller
                      name="topicIds"
                      control={control}
                      render={({ field }) => (
                        <Combobox
                          multiple
                          id="topics"
                          items={topics.map((topic) => ({
                            label: topic.title,
                            value: topic.id,
                          }))}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <ComboboxTrigger
                            render={
                              <Button
                                variant="outline"
                                className="w-64 justify-between font-normal overflow-hidden "
                              >
                                <div className="pr-5 overflow-hidden">
                                  <ComboboxValue placeholder="Select topic" />
                                </div>
                                <ChevronDown />
                              </Button>
                            }
                          />

                          <ComboboxContent>
                            <ComboboxEmpty>No topics found.</ComboboxEmpty>

                            <ComboboxList>
                              {(item) => (
                                <ComboboxItem
                                  key={item.value}
                                  value={item.value}
                                >
                                  {item.label}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                            <ComboboxChips
                              ref={anchor}
                              className="w-full max-w-xs"
                            >
                              <ComboboxValue>
                                {(values) => (
                                  <>
                                    {values.map(
                                      (value: React.Key | null | undefined) => (
                                        <ComboboxChip key={value}>
                                          {
                                            topics.find(
                                              (topic) => topic.id === value,
                                            )?.title
                                          }
                                        </ComboboxChip>
                                      ),
                                    )}

                                    <ComboboxChipsInput />
                                  </>
                                )}
                              </ComboboxValue>
                            </ComboboxChips>
                          </ComboboxContent>
                        </Combobox>
                      )}
                    />
                  </FieldGroup>
                </FieldGroup>
                <Button
                  size="lg"
                  className="w-full my-5 py-5"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Spinner />}
                  {isSubmitting
                    ? "Creating publication and Uploading Files..."
                    : "Create Publication"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
