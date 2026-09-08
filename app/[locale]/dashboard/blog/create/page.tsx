'use client'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend } from "@/components/ui/field";
import Editor from "../../components/editor/Editor";
import { EmptyDemo } from "../../components/EmptyFile";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { ComboBoxCategory } from "../../components/CategoryComboBox";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { Separator } from "@base-ui/react";
import { Checkbox } from "@/components/ui/checkbox";


export default function CreatePage() {
    return <section className="w-full px-5 sm:px-15 xl:px-30 mt-10">
        <article>
            <h3 className="text-foreground text-2xl">Create Post</h3>
            <p className="text-muted-foreground">Here you can create a blog entry as post</p>
        </article>

        <section className="w-full my-5 xl:mt-10 grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-10">
            <article className="w-full">
                <Editor />
            </article>
            <article className="w-full xl:border-l border-accent xl:px-10 -mt-10 ">
                <div className="w-full border-b border-accent py-2">
                    <p className="text-foreground text-2xl font-light">Post Information</p>
                    <p className="text-muted-foreground text-sm font-light">Lorem ipsum dolor sit amet.</p>
                </div>
                <div className="xl:max-h-[55vh] py-5 scrollbar-none overflow-auto">
                    <div className="w-full">
                        <p className="text-foreground text-xl font-light">Post Banner</p>
                        <p className="text-muted-foreground text-sm font-light">Lorem ipsum dolor sit amet.</p>
                    </div>
                    <div className="mt-5 w-full">
                        <EmptyDemo />
                    </div>
                    <form className="w-full mt-5" action="">
                        <FieldGroup>
                            <FieldGroup>
                                <Field aria-required>
                                    <FieldLabel aria-required htmlFor="title">Title</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput required type="text" placeholder="Post Title" />
                                    </InputGroup>
                                </Field>
                                <Field aria-required>
                                    <FieldLabel aria-required htmlFor="title">Description</FieldLabel>
                                    <Textarea className="resize-none" placeholder="Post Description"></Textarea>
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
                                    <Field aria-required className="w-fit">

                                        <FieldLabel aria-required htmlFor="category" className="hover:underline decoration-input cursor-pointer decoration-2 underline-offset-4">Category</FieldLabel>
                                        <ComboBoxCategory />
                                    </Field>
                                </FieldGroup>
                                <Separator className={"h-0.5 bg-accent w-full"} />

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
                                <Separator className={"h-0.5 bg-accent w-full"} />

                                <Field orientation={'horizontal'}>

                                    <Checkbox name="allow_interactions" id="allow_interactions" />
                                    <FieldLabel htmlFor="allow_interactions">
                                        Allow Interactions
                                    </FieldLabel>
                                </Field>
                            </FieldGroup>
                        </FieldGroup>

                    </form>
                </div>
               <div className="w-full border-t border-accent py-2">
                 <Button className="w-full mt-5 py-5">Create Post</Button>
               </div>
            </article>
        </section>
    </section>
}