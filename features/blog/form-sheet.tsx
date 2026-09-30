"use client"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend } from "@/components/ui/field";
import { EmptyDemo } from "@/features/blog/empty-state";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { Separator } from "@base-ui/react";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboBoxCategory } from "@/features/post/category-combo-box";

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


type LexicalNode = {
    type?: string;
    src?: string;
    altText?: string;
    width?: number | null;
    height?: number | null;
    children?: LexicalNode[];
};



import { Pencil2Icon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateBlogPostFormValues, createBlogPostSchema } from "@/lib/schemas/blog-post";
import { toast } from "@/components/ui/toast";
import { useEditorStore } from "@/app/[locale]/dashboard/blog/create/page";
import { create } from "@/actions/blog/create";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

async function blobUrlToFile(
    blobUrl: string,
    filename: string,
): Promise<File> {
    const response = await fetch(blobUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${blobUrl}`);
    }

    const blob = await response.blob();

    return new File([blob], filename, {
        type: blob.type,
    });
}

function getImageNodes(node: LexicalNode): LexicalNode[] {
    const images: LexicalNode[] = [];

    if (node.type === "image" && node.src?.startsWith("blob:")) {
        images.push(node);
    }

    if (node.children) {
        for (const child of node.children) {
            images.push(...getImageNodes(child));
        }
    }

    return images;
}
export function FormSheet() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState<boolean>(false)
    const { data } = useSession();
    const [file, setFile] = useState<File | null>();
    const json = useEditorStore(state => state.json)
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
    } = useForm<CreateBlogPostFormValues>({
        resolver: zodResolver(createBlogPostSchema),

        defaultValues: {
            title: "",
            description: "",
            visibility: "public",
            allowInteractions: "all",
            categoryId: "",
            topicIds: [],
        },
    });
    const anchor = useComboboxAnchor();
    async function onSubmit(values: CreateBlogPostFormValues) {
        setLoading(true);
        if (!file?.bytes) {
            toast.add({
                type: "error",
                description: "Debés agregar un banner.",
                priority: "high",
            });

            return;
        }

        if (json.length == 0) {
            toast.add({
                type: "error",
                description: "The post rich text is empty",
                priority: "high",
            });

            return;
        }

        const editorText = JSON.parse(json);

        const text = editorText.root.children
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((node: any) => node.children?.map((child: any) => child.text ?? "").join("") ?? "")
            .join("")
            .trim();

        if (!text) {
            toast.add({
                type: "error",
                description: "The post rich text is empty",
                priority: "high",
            });

            return;
        }

        const imageNodes = getImageNodes(editorText.root);

        // 2. Convertir blob URLs → Files
        const imageFiles = await Promise.all(
            imageNodes.map(async (node) => {
                const file = await blobUrlToFile(
                    node.src!,
                    node.altText || "image",
                );

                return {
                    node,
                    file,
                };
            }),
        );

        


        await create({
            userId: data?.user?.id,
            allowInteractions: values.allowInteractions,
            banner: { file: file, alt: values.title },
            categoryId: values.categoryId,
            content: json,
            description: values.description,
            title: values.title,
            topicIds: values.topicIds,
            contentImages: imageFiles,
            visibility: values.visibility
        })
    }
    return (
        <Sheet>
            <SheetTrigger render={<Button variant="outline"><Pencil2Icon /> Post data</Button>} />
            <SheetContent className="min-w-[500px]">
                <SheetHeader>
                    <SheetTitle>Post data</SheetTitle>
                    <SheetDescription>
                        Make changes to your post here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <article className="w-full px-5 border-accent overflow-y-auto scrollbar-none">
                    <div className="py-5">
                        <div className="w-full">
                            <p className="text-foreground font-medium">Post Banner</p>
                            <p className="text-muted-foreground font-light">Lorem ipsum dolor sit amet. 1280 x 720px</p>
                        </div>
                        <div className="mt-5 w-full">
                            <EmptyDemo file={file} setFile={setFile} />
                        </div>
                        <form id="post-form" className="w-full mt-5 py-5" onSubmit={handleSubmit(onSubmit, (error) => {
                            console.log(error)
                        })}>
                            <FieldGroup>
                                <FieldGroup>
                                    <Field aria-required>
                                        <FieldLabel aria-required htmlFor="title">Title</FieldLabel>
                                        <InputGroup className="py-5">
                                            <InputGroupInput  {...register("title")} type="text" placeholder="Post Title" />
                                        </InputGroup>
                                        <FieldError>
                                            {errors.title && (
                                                <p className="text-sm text-destructive">
                                                    {errors.title.message}
                                                </p>
                                            )}
                                        </FieldError>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="title">Description</FieldLabel>
                                        <Textarea className="resize-none" {...register("description")} placeholder="Post Description"></Textarea>
                                        <FieldError>
                                            {errors.description && (
                                                <p className="text-sm text-destructive">
                                                    {errors.description.message}
                                                </p>
                                            )}</FieldError>
                                    </Field>
                                    <Separator className={"h-0.5 bg-accent w-full"} />
                                    <FieldGroup>
                                        <FieldLegend>
                                            Categories
                                        </FieldLegend>
                                        <FieldDescription className="flex flex-col mt-0 gap-0">
                                            Select categories and add new ones
                                            <Dialog>
                                                <DialogTrigger className={'w-fit justify-start px-2 mt-2 '} render={<Button variant={'outline'} className={"w-fit px-2"}>Create Category</Button>} />
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Create Category
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Lorem ipsum dolor sit amet consectetur.
                                                        </DialogDescription>
                                                        <form className="py-5">
                                                            <FieldGroup>
                                                                <Field>
                                                                    <FieldLabel htmlFor="category_title">Title</FieldLabel>
                                                                    <InputGroup>
                                                                        <InputGroupInput id="category_title" type="text" placeholder="Category title" />
                                                                    </InputGroup>
                                                                </Field>
                                                                <Field>
                                                                    <FieldLabel htmlFor="category_description">Description</FieldLabel>
                                                                    <Textarea id="category_description" className="resize-none" placeholder="Category description"></Textarea>
                                                                </Field>
                                                            </FieldGroup>
                                                        </form>
                                                        <DialogFooter>
                                                            <DialogClose>
                                                                Close
                                                            </DialogClose>
                                                            <Button>
                                                                Submit Category
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogHeader>
                                                </DialogContent>
                                            </Dialog>
                                        </FieldDescription>
                                    </FieldGroup>
                                    <Separator className={"h-0.5 bg-accent w-full"} />

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
                                    <Separator className={"w-full h-0.5 bg-accent"} />
                                    <Field className="w-fit" aria-required>

                                        <FieldLabel aria-required htmlFor="category">Visibility</FieldLabel>
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
                                    </Field>
                                </FieldGroup>
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
                        </form>
                    </div>

                </article>
                <SheetFooter>
                    <Button disabled={loading} form="post-form" type="submit">{loading && <Spinner/>} Save changes</Button>
                    <SheetClose render={<Button variant="outline">Close</Button>} />
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}



