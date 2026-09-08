'use client'
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/src/components/Header";
import { BasicMasonry } from "@/src/components/masonry";
import { MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Filter, FilterIcon, FilterXIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { DatePickerDemo } from "@/src/components/DatePicker";

export default function FeedPage() {
    return <div>
        <Header />
        <section className="w-full px-5 sm:px-15 xl:px-30 mt-20">
            <article className="flex flex-col my-5">
                <h4 className="text-2xl font-semibold sm:text-4xl">Feed</h4>
                <p className="text-muted-foreground text-xl font-light w-2/3    ">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium amet aliquid inventore fugit nihil ratione obcaecati rerum nisi voluptate, quae deleniti dolore tenetur nam! A dolores molestias perferendis reiciendis impedit.</p>
            </article>

            <div className="w-full flex items-center justify-between mt-10">
                <Tabs defaultValue="everything">
                    <TabsList variant="line">
                        <TabsTrigger value="everything">Everything</TabsTrigger>
                        <TabsTrigger value="portraits">Portraits</TabsTrigger>
                        <TabsTrigger value="works">Works</TabsTrigger>
                        <TabsTrigger value="collections">Collections</TabsTrigger>

                    </TabsList>
                </Tabs>
                <div className="flex gap-2">
                    <Popover >
                        <PopoverTrigger render={<Button className="px-5 flex items-center"><FilterIcon />Filter</Button>} />

                        <PopoverContent align="end" className='px-5 py-3'>
                            <PopoverHeader>
                                <PopoverTitle className='text-xl font-bold'>
                                    Filters
                                </PopoverTitle>
                                <PopoverDescription>
                                    Lorem ipsum dolor sit amet consectetur.
                                </PopoverDescription>
                                <div className="w-full mt-5 flex flex-col gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="airplane-mode" checked />
                                        <Label htmlFor="airplane-mode">Enable Filters</Label>

                                    </div>
                                    <InputGroup className="max-w-xs">
                                        <InputGroupInput placeholder="Search..." />
                                        <InputGroupAddon>
                                            <MagnifyingGlassIcon />
                                        </InputGroupAddon>
                                        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
                                    </InputGroup>
                                    <DatePickerDemo />
                                </div>
                            </PopoverHeader>

                        </PopoverContent>
                    </Popover>
                    <Button><ReloadIcon /></Button>
                </div>
            </div>
            <article className="w-full mt-5">
                <BasicMasonry />
            </article>

        </section>
        <footer className="w-full mt-10 bg-background border-accent border py-10">
            <p className="text-center  text-muted-foreground">Made with love by Joaquin Alvarez ❤</p>
            <nav className="flex w-full justify-center gap-4 text-muted-foreground">
                <a href="">about</a>
                <a href="">gallery</a>
                <a href="">blog</a>
                <a href="">projects</a>
            </nav>
        </footer>
    </div>
}